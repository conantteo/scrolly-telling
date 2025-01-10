/* eslint-disable no-case-declarations */
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

// Function to convert JSON state to formatted HTML
export function convertJsonToHTML(json) {
  let html = '';

  json.content?.forEach((node) => {
    switch (node.type) {
      case 'paragraph':
        html += processBlock('p', node);
        break;

      case 'heading':
        const level = node.attrs?.level || 1;
        html += processBlock(`h${level}`, node);
        break;

      case 'hardBreak':
        html += '<br>\n';
        break;

      case 'bulletList':
        html += `<ul>\n${processListItems(node.content)}</ul>\n`;
        break;

      case 'orderedList':
        html += `<ol>\n${processListItems(node.content)}</ol>\n`;
        break;

      case 'horizontalRule':
        html += '<hr>\n';
        break;

      case 'blockquote':
        html += `<blockquote>${processTextContent(node.content)}</blockquote>\n`;
        break;
    }
  });

  return html;
}

// Helper function to process block-level elements
function processBlock(tag, node) {
  let attrs = '';

  // Process text alignment
  if (node.attrs?.textAlign) {
    attrs += ` style="text-align: ${node.attrs.textAlign};"`;
  }

  return `<${tag}${attrs}>${processTextContent(node.content)}</${tag}>\n`;
}

// Helper function to process list items
function processListItems(items) {
  if (!items) {
    return '';
  }

  return items
    .map((item) => {
      if (item.type !== 'listItem' || !item.content) {
        return '';
      }

      // Process the content of each list item
      let itemContent = '';
      item.content.forEach((content) => {
        switch (content.type) {
          case 'paragraph':
            itemContent += processTextContent(content.content);
            break;
          case 'bulletList':
          case 'orderedList':
            const tag = content.type === 'bulletList' ? 'ul' : 'ol';
            itemContent += `<${tag}>\n${processListItems(content.content)}</${tag}>\n`;
            break;
          default:
            itemContent += processTextContent([content]);
        }
      });

      return `  <li>${itemContent}</li>\n`;
    })
    .join('');
}

// Helper function to process text content with marks
function processTextContent(content) {
  if (!content) {
    return '';
  }

  return content
    .map((item) => {
      let text = item.text || '';

      if (item.marks) {
        item.marks.forEach((mark) => {
          switch (mark.type) {
            case 'bold':
              text = `<strong>${text}</strong>`;
              break;

            case 'italic':
              text = `<em>${text}</em>`;
              break;

            case 'underline':
              text = `<u>${text}</u>`;
              break;

            case 'strike':
              text = `<s>${text}</s>`;
              break;

            case 'code':
              text = `<code>${text}</code>`;
              break;

            case 'link':
              const href = mark.attrs?.href || '';
              const target = mark.attrs?.target || '_blank';
              const rel = mark.attrs?.rel || 'noopener noreferrer';
              text = `<a href="${href}" target="${target}" rel="${rel}">${text}</a>`;
              break;

            case 'superscript':
              text = `<sup>${text}</sup>`;
              break;

            case 'subscript':
              text = `<sub>${text}</sub>`;
              break;

            case 'highlight':
              text = `<mark>${text}</mark>`;
              break;

            case 'textStyle':
              let style = '';
              if (mark.attrs?.color) {
                style += `color: ${mark.attrs.color};`;
              }
              if (mark.attrs?.fontSize) {
                style += `font-size: ${mark.attrs.fontSize};`;
              }
              if (style) {
                text = `<span style="${style}">${text}</span>`;
              }
              break;
          }
        });
      }

      return text;
    })
    .join('');
}
