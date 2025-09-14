---
title: 'Hello World!'
slug: 'hello-world'
description: 'A demo article to test out the blog posting functionality and showcase the front matter system.'
author: 'Callum Tolley'
date: '2024-01-15'
draft: true
tags: ['demo', 'blog', 'hello-world', 'testing']
---

# Hi there!

This is a test of the blogging system

## Testing Markdown Features

### Lists

Here's an unordered list:

- First item
- Second item with **bold text**
- Third item with _italic text_
- Fourth item with `inline code`

And an ordered list:

1. First numbered item
2. Second numbered item
3. Third numbered item

### Code Blocks

Here's a code block:

```javascript
function greet(name) {
  return `Hello, ${name}!`;
}

console.log(greet('World'));
```

... and another more complex one!

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <title>blah</title>
    <style>
      .content-red {
        text-color: 'red';
      }
    </style>
    <script>
      const x = 2 * 3;
      console.log(x);
    </script>
  </head>
  <body>
    <h1>Heading</h1>
    <hr />
    <p>I'm the content! (in <span class="content-red">red</span>)</p>
  </body>
</html>
```

### Links and Images

- [External link](https://example.com)
- [Internal link](/projects)
- ![Alt text for image](https://dummyimage.com/300x200)

### Blockquotes

> This is a blockquote. It can contain multiple lines
> and is great for highlighting important information.

### Tables

This is some test
(and this text is on the same line!)

| Feature      | Status | Notes               |
| ------------ | ------ | ------------------- |
| Markdown     | ✅     | Working             |
| Front Matter | ✅     | Complete            |
| Code Blocks  | ✅     | Syntax highlighting |
| Images       | ⚠️     | Need to test        |

Other test

### Horizontal Rule

---

### Emphasis

**Bold text** and _italic text_ and **_bold italic text_**

### Strikethrough

~~This text is crossed out~~

### Task Lists

- [x] Create front matter
- [x] Test markdown features
- [ ] Deploy blog system
- [ ] Write real content

```

```
