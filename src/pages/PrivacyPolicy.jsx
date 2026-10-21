import LegalPage from '../components/legal/LegalPage';
import { privacySections } from '../data/privacyPolicy';

export default function PrivacyPolicy() {
  return (
    <LegalPage
      title="Privacy Policy"
      documentTitle="Privacy Policy | Afreak"
      description="How Afreak collects, uses, and protects your personal information."
      tocLabel="Privacy sections"
      sections={privacySections}
    />
  );
}
