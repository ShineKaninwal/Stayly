"""The real models live in app/models.py; this package would otherwise shadow it."""
import sys
from importlib.util import module_from_spec, spec_from_file_location
from pathlib import Path

_name = "app._models_impl"
_spec = spec_from_file_location(_name, Path(__file__).resolve().parent.parent / "models.py")
_mod = module_from_spec(_spec)
sys.modules[_name] = _mod
_spec.loader.exec_module(_mod)

User, Property, Wishlist = _mod.User, _mod.Property, _mod.Wishlist
