"""The old SOL 101 truss deck has been superseded by the visual comparisons."""
from pathlib import Path
import runpy

runpy.run_path(str(Path(__file__).with_name("check-analysis-scenarios.py")), run_name="__main__")
