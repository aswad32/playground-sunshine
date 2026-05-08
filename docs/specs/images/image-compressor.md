# Image Compressor / Resizer Spec

## Goal

Compress and optionally resize images in the browser to reduce file size. Show before/after file size comparison.

## Route

/tools/image-compressor

## Inputs

- File upload: image file (JPEG, PNG, WebP)
- Range slider: quality (1–100, default 80)
- Optional: target width and/or height in pixels (maintain aspect ratio by default)
- Toggle: maintain aspect ratio

## Actions

- Compress / Resize — process the image in the browser
- Download — save the processed image
- Clear — reset inputs and output

## Output

- Preview of the compressed/resized image
- Original file size vs. compressed file size
- Dimensions before and after

## Error Handling

- If the uploaded file is not a supported image format, show: "Please upload a JPEG, PNG, or WebP image."
- If the target dimensions are invalid (e.g. zero or negative), show: "Please enter valid dimensions."

## Privacy

Runs fully in the browser using Canvas and Blob APIs. Images are never uploaded to a server.

## Tests

- Compressing a JPEG produces a smaller file
- Resizing to a target width produces correct output dimensions
- Aspect ratio is maintained when only width is set
- Aspect ratio is maintained when only height is set
- Both width and height can be set independently when aspect ratio toggle is off
- Target dimension of 0 or negative shows validation error
- Unsupported file type shows error
- Before/after file sizes are displayed correctly
