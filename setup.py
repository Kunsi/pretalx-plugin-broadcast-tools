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
    name="pretalx-plugin-lower-thirds",
    version="0.1.0",
    description=(
        "Creates lower thirds from your current schedule. Will show "
        "speaker names and talk title using the configured track and "
        "event colours."
    ),
    long_description=long_description,
    url="https://git.franzi.business/kunsi/pretalx-plugin-lower-thirds",
    author="kunsi",
    author_email="git@kunsmann.eu",
    license="Apache Software License",
    install_requires=[],
    packages=find_packages(exclude=["tests", "tests.*"]),
    include_package_data=True,
    cmdclass=cmdclass,
    entry_points="""
[pretalx.plugin]
pretalx_lower_thirds=pretalx_lower_thirds:PretalxPluginMeta
""",
)
