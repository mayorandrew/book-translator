# Book Translator App

We're creating an application that helps language lerners to read books, translating them side by side using ChatGPT API.
The application first asks user for the OpenAI API key.
The application then shows a full-screen textarea input, where the text of the book can be inserted.
There is also a button in the bottom-right which says "Translate".
When the button is pressed, the text is sent to the ChatGPT API in batches.
The batches are prepared in a way that they contain at most 10000 characters, but the text can only be split by newlines.
The ChatGPT prompt asks it to split the text into sentences, translate each sentence into russian, and then return them as a JSON list of objects, one object per line, where each object contains two fields: "original" with the original sentence and "translated" with the translated sentence.
The response is streamed back to the app.
The screen switches to the results view, where there is a table with two columns. Left column shows the original sentence, right column shows the target sentence.
The columns appear streaming as soon as responses from ChatGPT are received.
