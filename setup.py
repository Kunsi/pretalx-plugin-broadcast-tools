import os
from distutils.command.build import build

from django.core import management
from setuptools import find_packages, setup

try:
    with open(
        os.path.join(os.path.dirname(__file__), "README.rst"), encoding="utf-8"
    ) as f:
        long_description = f.read()
except FileNotFoundError:
    long_description = ""


class CustomBuild(build):
    def run(self):
        management.call_command("compilemessages", verbosity=1)
        build.run(self)


cmdclass = {"build": CustomBuild}


setup(
    name="pretalx-plugin-broadcast-tools",
    version="0.3,0",
    description=(
        "Some tools which can be used for supporting a broadcasting "
        "software, for example a 'lower third' page which can be "
        "embedded into your broadcasting software"
    ),
    long_description=long_description,
    url="https://github.com/Kunsi/pretalx-plugin-broadcast-tools",
    author="kunsi",
    author_email="git@kunsmann.eu",
    license="Apache Software License",
    install_requires=[],
    packages=find_packages(exclude=["tests", "tests.*"]),
    include_package_data=True,
    cmdclass=cmdclass,
    entry_points="""
[pretalx.plugin]
pretalx_broadcast_tools=pretalx_broadcast_tools:PretalxPluginMeta
""",
)
