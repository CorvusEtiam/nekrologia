import typing 
import sqlite3

import click 
from flask import current_app, g, Flask  
from flask.cli import with_appcontext

def select(cols, table, where=None):
    if type(cols) is list:
        cols_str = ', '.join(cols)
    if where is None:
        return "SELECT ({}) FROM {}".format(cols_str, table)
    else:    
        return "SELECT ({}) FROM {} WHERE {}".format(cols_str, table, where)

def get_db() -> sqlite3.Connection:
    if 'db' not in g:
        g.db = sqlite3.connect(
            current_app.config['DATABASE'],
            detect_types=sqlite3.PARSE_DECLTYPES
        )

        g.db.row_factory = sqlite3.Row 
    return g.db 

def init_db():
    db = get_db()
    with current_app.open_resource('schema.sql') as res:
        db.executescript(res.read().decode('utf8'))

@click.command('init-db')
@with_appcontext
def init_db_cmd():
    init_db()
    click.echo("Initialized the database")

def init_app(app : Flask):
    app.teardown_appcontext(close_db)
    app.cli.add_command(init_db_cmd)

def close_db(e = None):
    db = g.pop('db', None)
    if db is not None:
        db.close()