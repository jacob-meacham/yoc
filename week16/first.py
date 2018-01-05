from first.app import app
import os

if __name__ == '__main__':
    port = os.environ.get('PORT', 5000)

    from waitress import serve
    print('Serving app on {}'.format(port))
    serve(app, host='0.0.0.0', port=port)
