import React from 'react';
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css'; // Import styles
import './RichTextEditor.css'; // Import custom styles

const RichTextEditor = ({ value, onChange, error, id, name, helperText, handleBlur, maxLength }) => {
    const handleChange = (content, delta, source, editor) => {
        onChange(content); // Pass the rich text content to Formik
    };
    const handleEditorBlur = () => {
        handleBlur({ target: { name } });
    };

    const characterCount = value.replace(/<\/?[^>]+(>|$)/g, "").replace(/\n/g, "").trim().length;

    return (
        <div className="editor-container">
            <ReactQuill
                value={value}
                onChange={handleChange}
                modules={RichTextEditor.modules}
                formats={RichTextEditor.formats}
                style={{ height: '300px' }}
                onBlur={handleEditorBlur}
                placeholder="Type your content here..."
                className={characterCount > maxLength || helperText ? 'over-limit-editor' : ''}
            />
            {helperText && (
                <div className={`helper-text`}>
                    {helperText}
                </div>
            )}
            <div  className={`char-count ${characterCount > maxLength || helperText ? 'over-limit' : ''}`}>
                {characterCount} / {maxLength}
            </div>
        </div>
    );
};

// Define the modules and formats for the editor
RichTextEditor.modules = {
    toolbar: [
        [{ 'header': 1 }, { 'header': 2 }],
        [{ size: [] }],
        ['bold', 'italic', 'underline', 'strike', 'blockquote'],
        [{ 'list': 'ordered' }, { 'list': 'bullet' },
        { 'indent': '-1' }, { 'indent': '+1' }],
        ['link'], ['emoji']
    ],

    clipboard: {
        // toggle to add extra line breaks when pasting HTML:
        matchVisual: false,
    }
};

RichTextEditor.formats = [
    'header', 'font', 'size',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'bullet', 'indent',
    'link', 'image', 'video'
];

export default RichTextEditor;
