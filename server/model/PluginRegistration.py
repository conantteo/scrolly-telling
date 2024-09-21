class PluginRegistration:
    def __init__(self, plugin_name: str, bucket_js_path: str, bucket_register_path: str, local_register_path: str, local_js_path: str, source_path: str):
        self.plugin_name = plugin_name
        self.bucket_js_path = bucket_js_path
        self.bucket_register_path = bucket_register_path
        self.local_register_path = local_register_path
        self.local_js_path = local_js_path
        self.source_path = source_path