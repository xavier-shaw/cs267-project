from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import pickle
import json
import uvicorn
import numpy as np
from spn.algorithms.Inference import likelihood
from fastapi.middleware.cors import CORSMiddleware

# Load the SPN model
with open("spn_model.pkl", "rb") as f:
    spn_model = pickle.load(f)

with open("feature_names.json", "r") as f:
    feature_names = json.load(f)

VECTOR_LEN = len(feature_names)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)

object_category_mappings = {
    'person': ['man', 'woman', 'people', 'boy', 'girl', 'person'],
    'body_part': ['hand', 'leg', 'ear', 'eye', 'nose', 'head', 'hair', 'face', 'mouth', 'neck', 'arm', 'foot'],
    'clothing': ['shirt', 'pants', 'jacket', 'hat', 'shoe', 'shorts', 'jeans', 'cap', 'shoes', 'glasses', 'coat', 'uniform', 'dress', 't-shirt'],
    'animal': ['cat', 'dog', 'bird', 'horse', 'cow', 'sheep', 'pig', 'zebra', 'elepant', 'tiger', 'giraffe'],
    'vehicle': ['car', 'bus', 'truck', 'bike', 'motorcycle', 'airplane', 'boat', 'train'],
    'furniture': ['table', 'chair', 'bench', 'bed', 'desk', 'cabinet', 'shelf'],
    'building_part': ['window', 'wall', 'door', 'roof', 'floor', 'ceiling', 'sign'],
    'nature': ['sky', 'ground', 'tree', 'grass', 'leaves', 'flower', 'bush', 'branch'],
    'food': ['food', 'pizza', 'banana', 'broccoli', 'orange', 'fruit', 'cheese', 'donut']
}

OBJECTS = [item for sublist in object_category_mappings.values()
           for item in sublist]

RELATIONSHIPS = {"to the left of", "to the right of", "in front of",
                 "behind", "on", "in", "above", "below", "next to", "under"}

ATTRIBUTES = [
    "tall", "short", "large", "small", "big", "little",
    "white", "black", "blue", "brown", "gray", "blonde", "red",
    "walking", "running", "jumping", "sitting", "standing", "lying", "sleeping", "flying",
]


class Entity(BaseModel):
    id: int
    name: str
    category: str
    attributes: List[str] = []


class Relationship(BaseModel):
    name: str
    object: str
    subject: str


class SceneGraph(BaseModel):
    entities: Dict[str, Entity]
    relationships: List[Relationship]


def scene_graph_to_evidence(scene_graph: SceneGraph):
    evidences = []

    for entity in scene_graph.entities.values():
        evidence = f'has_{entity.name}'
        if evidence not in feature_names:
            continue
        evidences.append(evidence)

    for relationship in scene_graph.relationships:
        evidence = f'{relationship.object}_{relationship.name}_{relationship.subject}'
        if evidence not in feature_names:
            continue
        evidences.append(evidence)

    return evidences


def evidences_to_vector(evidences):
    vector = np.full(VECTOR_LEN, np.nan)
    for evidence in evidences:
        vector[feature_names.index(evidence)] = 1

    return vector


@app.get("/")
async def root():
    return {"message": "Scene Graph Processing API"}


@app.post("/parse-scene-graph")
async def process_scene_graph(scene_graph: SceneGraph):
    """Process a scene graph and return the evidence list"""
    try:
        entities = [entity for entity in list(scene_graph.entities.values()) if entity.name in OBJECTS]
        # parse scene graph to evidences
        evidences = scene_graph_to_evidence(scene_graph)
        # query the probability of an object co-occurring with another object
        co_occur_probs = query_co_occur_object(evidences)
        # query the probability of an object having an attribute
        attr_probs_dict = {}
        for entity in entities:
            attr_probs = query_obj_attr(evidences, entity.name)
            attr_probs_dict[entity.name] = attr_probs
        # query the probability of a relationship between two objects
        relation_probs_dict = {}
        for i in range(len(entities)):
            entity_1 = entities[i]
            for j in range(i + 1, len(entities)):
                entity_2 = entities[j]
                relation_probs_1 = query_relationship(entity_1.name, entity_2.name)
                relation_probs_2 = query_relationship(entity_2.name, entity_1.name)
                
                if len(relation_probs_1) > 0:
                    relation_probs_dict[f"{entity_1.name}_{entity_2.name}"] = relation_probs_1
                if len(relation_probs_2) > 0:
                    relation_probs_dict[f"{entity_2.name}_{entity_1.name}"] = relation_probs_2
            
        # return the results
        return {
            "evidences": evidences,
            "co_occur_probs": co_occur_probs,
            "attr_probs": attr_probs_dict,
            "relation_probs": relation_probs_dict
        }
    except Exception as e:
        print("error: ", e)
        raise HTTPException(status_code=400, detail=str(e))


def query_marginal(evidences):
    evidence_vec = evidences_to_vector(evidences)
    prob = likelihood(spn_model, evidence_vec[None, :])[0, 0]

    return prob

# query the probability of an object co-occurring with another object
def query_co_occur_object(evidences, top_k=10):
    co_occur_probs = []
    evidence_vector = evidences_to_vector(evidences)
    p_evidences = likelihood(spn_model, evidence_vector[None, :])[0, 0]

    for obj in OBJECTS:
        feature_name = f"has_{obj}"
        if feature_name not in feature_names:
            continue  # or raise an error
        feature_idx = feature_names.index(feature_name)
        if evidence_vector[feature_idx] == 1:
            continue

        co_occur_vector = np.copy(evidence_vector)
        co_occur_vector[feature_idx] = 1

        p_joint = likelihood(spn_model, co_occur_vector[None, :])[0, 0]
        p_cond = p_joint / p_evidences if p_evidences > 0 else 0

        co_occur_probs.append((obj, p_cond))

    co_occur_probs.sort(key=lambda x: x[1], reverse=True)
    co_occur_probs = [(obj, p.round(4)) for obj, p in co_occur_probs]
    return co_occur_probs[:top_k]

# query the probability of an object having an attribute
def query_obj_attr(evidences, evidence_obj, top_k=10):
    attr_probs = []
    evidence_vector = evidences_to_vector(evidences)
    p_evidences = likelihood(spn_model, evidence_vector[None, :])[0, 0]

    for attr in ATTRIBUTES:
        feature_name = f"{evidence_obj}_attr_{attr}"
        if feature_name not in feature_names:
            continue  # or raise an error
        feature_idx = feature_names.index(feature_name)
        if evidence_vector[feature_idx] == 1:
            continue

        co_occur_vector = np.copy(evidence_vector)
        co_occur_vector[feature_idx] = 1

        p_joint = likelihood(spn_model, co_occur_vector[None, :])[0, 0]
        p_cond = p_joint / p_evidences if p_evidences > 0 else 0

        attr_probs.append((attr, p_cond))

    attr_probs.sort(key=lambda x: x[1], reverse=True)
    attr_probs = [(attr, p.round(4)) for attr, p in attr_probs]
    return attr_probs[:top_k]

# query the probability of a relationship between two objects
def query_relationship(evidence_obj, evidence_subj, top_k=10):
    relation_probs = []
    evidence_vector = evidences_to_vector(
        [f"has_{evidence_obj}", f"has_{evidence_subj}"])
    p_evidences = likelihood(spn_model, evidence_vector[None, :])[0, 0]

    for rel in RELATIONSHIPS:
        feature_name = f"{evidence_obj}_{rel}_{evidence_subj}"
        if feature_name not in feature_names:
            continue  # or raise an error
        feature_idx = feature_names.index(feature_name)
        if evidence_vector[feature_idx] == 1:
            continue

        co_occur_vector = np.copy(evidence_vector)
        co_occur_vector[feature_idx] = 1

        p_joint = likelihood(spn_model, co_occur_vector[None, :])[0, 0]
        p_cond = p_joint / p_evidences if p_evidences > 0 else 0

        relation_probs.append((rel, p_cond))

    relation_probs.sort(key=lambda x: x[1], reverse=True)
    relation_probs = [(rel, p.round(4)) for rel, p in relation_probs]
    return relation_probs[:top_k]


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
