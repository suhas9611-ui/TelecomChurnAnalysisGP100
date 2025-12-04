"""Configuration Loader"""
import yaml
from pathlib import Path

class ConfigLoader:
    def __init__(self, config_path="config/settings.yaml"):
        self.config_path = config_path
        self.config = self._load_config()
    
    def _load_config(self):
        try:
            current_dir = Path(__file__).parent.parent.parent
            config_file = current_dir / self.config_path
            with open(config_file, 'r') as f:
                return yaml.safe_load(f)
        except:
            return {}
    
    def get(self, key_path, default=None):
        keys = key_path.split('.')
        value = self.config
        for key in keys:
            if isinstance(value, dict) and key in value:
                value = value[key]
            else:
                return default
        return value
    
    def get_path(self, key_path):
        path = self.get(key_path)
        if path:
            current_dir = Path(__file__).parent.parent.parent
            return str(current_dir / path)
        return None

config = ConfigLoader()
