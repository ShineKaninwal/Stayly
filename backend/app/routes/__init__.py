"""The real blueprint lives in app/routes.py; this package would otherwise shadow it."""
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

_name = "app._routes_impl"
_spec = spec_from_file_location(_name, Path(__file__).resolve().parent.parent / "routes.py")
_mod = module_from_spec(_spec)
sys.modules[_name] = _mod          # registered first so it is only ever loaded once
_spec.loader.exec_module(_mod)

bp = _mod.bp
