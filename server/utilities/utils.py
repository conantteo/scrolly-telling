import os
from jinja2 import Environment, FileSystemLoader


def generate_js_function(template_path, output_file, **kwargs):
    # Get the directory and filename from the full path
    template_dir, template_file = os.path.split(template_path)

    # Set up the Jinja2 environment
    env = Environment(loader=FileSystemLoader(template_dir))

    # Load the template
    template = env.get_template(template_file)

    # Render the template with the provided variables
    rendered_js = template.render(**kwargs)

    # Write the rendered JavaScript to the output file
    with open(output_file, 'w') as file:
        file.write(rendered_js)

    print(f"JavaScript function generated in {output_file}")
