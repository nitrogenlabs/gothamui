import i18n from 'i18next';
import {useState} from 'react';
import {createRoot} from 'react-dom/client';
import {initReactI18next} from 'react-i18next';

import {Checkbox} from '../../src/components/Checkbox/Checkbox.js';
import {DropUpload} from '../../src/components/DropUpload/DropUpload.js';
import {Form} from '../../src/components/Form/Form.js';
import {Markdown} from '../../src/components/Markdown/Markdown.js';
import {SelectField} from '../../src/components/SelectField/SelectField.js';
import {TextField} from '../../src/components/TextField/TextField.js';

void i18n.use(initReactI18next).init({lng: 'en', resources: {en: {translation: {}}}});

const defaultValues = {accepted: false, email: '', role: 'reader'};
const options = [{id: 'reader', label: 'Reader', value: 'reader'}, {id: 'writer', label: 'Writer', value: 'writer'}];

const App = () => {
  const [submission, setSubmission] = useState('');
  return <>
    <Form defaultValues={defaultValues} onSubmit={(values) => { setSubmission(JSON.stringify(values)); }}>
      {({formState}) => <>
        <TextField label="Email" name="email" />
        <TextField label="Password" name="password" showPasswordToggle type="password" />
        <SelectField label="Role" name="role" options={options} />
        <Checkbox label="Accept terms" name="accepted" />
        <button disabled={formState.isSubmitting} type="submit">Save</button>
      </>}
    </Form>
    <Markdown content="## Preview" />
    <DropUpload accept="image/*" browseLabel="Browse images" />
    <output aria-label="Submission">{submission}</output>
  </>;
};

createRoot(document.getElementById('root')!).render(<App />);
