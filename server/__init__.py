import logging
import sys

logger = logging.getLogger(__name__)
logger.setLevel(logging.INFO)

stdout_handler = logging.StreamHandler(stream=sys.stdout)
format_output = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
# Register the formatter to the stdout handler
stdout_handler.setFormatter(format_output)
logger.addHandler(stdout_handler)