from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import sng_parser
from pprint import pprint
from typing import Dict, List, Optional
import uvicorn
from fastapi.middleware.cors import CORSMiddleware
from diffusers import DiffusionPipeline
from fastapi.responses import Response
from io import BytesIO

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=['*'],
    allow_credentials=False,
    allow_methods=["*"],
    allow_headers=["*"],
)


pipe = DiffusionPipeline.from_pretrained("stable-diffusion-v1-5/stable-diffusion-v1-5")
pipe = pipe.to("mps")

# Recommended if your computer has < 64 GB of RAM
pipe.enable_attention_slicing()


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

def get_obj_category(obj_name: str) -> Optional[str]:
    for category, synonyms in object_category_mappings.items():
        if obj_name in synonyms:
            return category
    return None


def reformat_scene_graph(scene_graph: Dict) -> Dict:
    new_scene_graph = {
        "entities": {},
        "relationships": []
    }

    for idx, entity in enumerate(scene_graph['entities']):
        if entity['head'] not in OBJECTS:
            continue
        
        formatted_entity = {
            'id': idx,
            'name': entity['head'],
            'category': get_obj_category(entity['head']),
            'attributes': []
        }
        for modifier in entity['modifiers']:
            if modifier['dep'] == 'amod' and modifier['span'] in ATTRIBUTES:
                formatted_entity['attributes'].append(modifier['span'])

        new_scene_graph['entities'][idx] = formatted_entity

    for relationship in scene_graph['relations']:
        if relationship['relation'] not in RELATIONSHIPS:
            continue
        
        formatted_relationship = {
            'name': relationship['relation'],
            'object': new_scene_graph['entities'][relationship['object']]['name'],
            'subject': new_scene_graph['entities'][relationship['subject']]['name']
        }
        new_scene_graph['relationships'].append(formatted_relationship)

    return new_scene_graph


class Prompt(BaseModel):
    text: str


class Entity(BaseModel):
    id: int
    name: str
    category: Optional[str]
    attributes: List[str]


class Relationship(BaseModel):
    name: str
    object: str
    subject: str


class SceneGraph(BaseModel):
    entities: Dict[int, Entity]
    relationships: List[Relationship]


@app.get("/")
async def root():
    return {
        "name": "Scene Graph Parser API",
        "version": "1.0.0",
        "description": "API for parsing natural language descriptions into scene graphs"
    }


@app.post("/parse-prompt", response_model=SceneGraph)
async def parse_text(input_data: Prompt):
    # try:
    scene_graph = sng_parser.parse(input_data.text)
    sng_parser.tprint(scene_graph)
    formatted_graph = reformat_scene_graph(scene_graph)

    return formatted_graph
    # except Exception as e:
    #     raise HTTPException(status_code=500, detail=str(e))


@app.post("/prompt-to-image")
async def prompt_to_image(input_data: Prompt):
    try:
        image = pipe(input_data.text).images[0]
        # Convert PIL Image to bytes
        img_byte_arr = BytesIO()
        image.save(img_byte_arr, format='PNG')
        img_byte_arr = img_byte_arr.getvalue()
        
        return Response(content=img_byte_arr, media_type="image/png")
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
