from setuptools import setup, find_packages

with open("requirements.txt") as f:
    requirements = f.read().splitlines()

setup(
    name="lerobot-server",
    version="0.1.0",
    description="웹소켓 기반 LeRobot 로컬 제어 서버",
    author="RoboSapiens",
    author_email="robosapiens@example.com",
    packages=find_packages(),
    install_requires=requirements,
    entry_points={
        "console_scripts": [
            "lerobot-server=server.main:start_server",
        ],
    },
    python_requires=">=3.8",
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
    ],
) 