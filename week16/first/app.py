from flask import Flask, render_template
# from cryptozoo.models import markov

app = Flask(__name__)
#app.config['TEMPLATES_AUTO_RELOAD'] = True
# with open("corpus/TableCaptions.txt") as f:
#     text = f.read()
#
# model = markov.build_model(text, True)

@app.route('/')
def index():
    return render_template('layout.html', **{
        'title': 'Welcome',
        'base_url': 'localhost:5000'
    })

@app.route('/submissions')
def submissions():
    return render_template('layout.html', **{
        'title': 'Welcome',
        'base_url': 'localhost:5000'
    })

@app.route('/program')
def program():
    return render_template('layout.html', **{
        'title': 'Welcome',
        'base_url': 'localhost:5000'
    })

@app.route('/program/award')
def award():
    return render_template('layout.html', **{
        'title': 'Welcome',
        'base_url': 'localhost:5000'
    })

@app.route('/program/paper/<paper>')
def paper():
    return render_template('layout.html', **{
        'title': 'Welcome',
        'base_url': 'localhost:5000'
    })

@app.route('/about')
def about():
    return render_template('layout.html', **{
        'title': 'About',
        'base_url': 'localhost:5000'
    })
