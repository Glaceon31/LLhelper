#-*- coding:utf-8 -*-
from app import app

def appa(environ, start_response):
    status = '200 OK'
    headers = [('Content-type', 'text/html; charset=utf-8')]
    start_response(status, headers)
    body=["Welcome to Baidu Cloud!\n"]
    return body

from bae.core.wsgi import WSGIApplication
application = WSGIApplication(app)
