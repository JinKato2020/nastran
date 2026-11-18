"""Use shared article and figure checks for this chapter."""
from pathlib import Path
import runpy,sys
sys.argv=[sys.argv[0],'materials']
runpy.run_path(str(Path(__file__).with_name("check-topic-articles.py")),run_name="__main__")
