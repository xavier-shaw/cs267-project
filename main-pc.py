from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import Dict, List, Optional
import pickle
import uvicorn
from spn.algorithms.Statistics import get_structure_stats
from fastapi.middleware.cors import CORSMiddleware

# Load the SPN model
with open("spn_model.pkl", "rb") as f:
    spn_model = pickle.load(f)

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


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


def scene_graph_to_evidence(scene_graph: SceneGraph) -> List[str]:
    evidences = []

    for entity in scene_graph.entities.values():
        evidence = f'has_{entity.category}'
        evidences.append(evidence)

    for relationship in scene_graph.relationships:
        evidence = f'{relationship.object}_{relationship.name}_{relationship.subject}'
        evidences.append(evidence)

    return evidences


@app.get("/")
async def root():
    return {"message": "Scene Graph Processing API"}


@app.post("/scene-graph")
async def process_scene_graph(scene_graph: SceneGraph):
    """Process a scene graph and return the evidence list"""
    try:
        evidences = scene_graph_to_evidence(scene_graph)
        return {
            "evidences": evidences
        }
    except Exception as e:
        raise HTTPException(status_code=400, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8001)
