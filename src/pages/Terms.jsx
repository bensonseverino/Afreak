import LegalPage from '../components/legal/LegalPage';
import { termsNotice, termsSections } from '../data/terms';

export default function Terms() {
  return (
    <LegalPage
      title="Terms & Conditions"
      documentTitle="Terms & Conditions | Afreak"
      description="The terms that apply when you browse, order, or create an account on Afreak."
      tocLabel="Terms sections"
      sections={termsSections}
      notice={termsNotice}
    />
  );
}
