import itertools
import json
import random
from slugify import slugify

from flask import Flask, render_template

from cryptozoo.models import markov

app = Flask(__name__)
app.config['TEMPLATES_AUTO_RELOAD'] = True

# TODO: Put this somewhere else
with open('models/title_markov_model.json') as f:
    model_definition = json.load(f)
    title_model = markov.load_model(model_definition)

@app.route('/')
def index():
    return render_template('index.html', **{
        'title': 'Index',
        'base_url': 'firstconf.org'
    })

@app.route('/submissions')
def submissions():
    return render_template('submissions.html', **{
        'title': 'Submissions',
        'base_url': 'firstconf.org'
    })

@app.route('/program')
def program():
    def get_titles():
        while True:
            sentence = title_model.make_sentence()
            if sentence:
                yield sentence

    titles = set(itertools.islice(get_titles(), 20))
    papers = [{'title': title, 'slug': slugify(title) } for title in titles]
    return render_template('program.html', **{
        'title': 'Program',
        'base_url': 'firstconf.org',
        'papers': papers

    })

@app.route('/program/award')
def award():
    return render_template('award.html', **{
        'title': 'Award',
        'base_url': 'firstconf.org'
    })

@app.route('/program/paper/<paper>')
def paper(paper):
    if random.random() < 0.1:
        return app.send_static_file('GlitchedPaper.pdf') 
    else:
        page = random.choice(['paper1.html', 'paper2.html', 'paper3.html', 'paper4.html'])
        return render_template(page, **{
            'title': 'Not Found',
            'base_url': 'firstconf.org'
        })

@app.route('/about')
def about():
    return render_template('about.html', **{
        'title': 'About',
        'base_url': 'firstconf.org'
    })
