function mySettings(props) {
const { settings, settingsStorage } = props;

  return (
    <Page>
      <Section>
        <TextInput
          label="👉 Tap here and paste your API key"
          settingsKey="APIkey"
          placeholder="Paste your API key here"
        />
      </Section>
    </Page>);
}

registerSettingsPage(mySettings);
