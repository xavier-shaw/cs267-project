# CS267 Final Project

> Yuwei Xiao, Anqi Liu, Michael Shi, Zihan Jiang

Our system consists of three modules:
* Scene Graph Processor
* Probabilistic Circuits
* User Interface

## Installation

### Scene Graph Processor

```
conda create -n cs267-sg python=3.10
conda activate cs267-sg
pip install requirements-sg.txt
python -m spacy download en
python -m main-sg
```

The scene graph processor will be running at port `8000`.

### Probabilistic Circuits

```
conda create -n cs267-pc python=3.8
conda activate cs267-pc
pip install requirements-pc.txt
pip install https://github.com/SPFlow/SPFlow/archive/refs/heads/master.zip
python -m main-pc
```

The probabilistic circuits will be running at port `8001`.

### User Interface

```
cd SG-PC-UI
npm install
npm run dev
```

The user interface will be running at port `5173`.

## Workflow

Once setup is complete, you can open the user interface in your browser.

To begin, enter a **text prompt**—e.g., *“a man and a dog”*—and click the `Generate` button. The system will parse your prompt into a **scene graph** and display its structure in the top-right panel. Simultaneously, the prompt is sent to a pre-trained diffusion model to generate an initial **image**.

Next, the system translates the scene graph into an evidence vector and queries a pre-trained **probabilistic circuit**. It performs several types of probabilistic reasoning, including (i) object co-occurrence, (ii) attribute co-occurrence, and (iii) likely relationships between objects. The results of these **queries** are displayed in the bottom-left panel.

You can then explore these **suggestions** and manually refine your original prompt by adding relevant attributes, relationships, or objects. After editing the prompt, clicking `Generate` again will produce a new **image** based on your updated input.


