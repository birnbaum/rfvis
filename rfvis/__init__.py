import click

from rfvis.server import start_server


@click.group()
def main():
    pass


@main.command()
@click.argument("data")
def gui(data):
    start_server(data, use_reloader=True, port=8080, debug=True)


if __name__ == '__main__':
    main()
