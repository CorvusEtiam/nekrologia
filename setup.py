from setuptools import setup 

setup(
    name = "nekrologia",
    packages =["nekrologia"],
    include_package_data = True,
    install_requires=["flask", "requests", "flask-login", "flask-sqlalchemy", "sqlalchemy", "mistune", "wtforms"]
)
