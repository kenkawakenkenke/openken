import request from "node-request";

registerSettingsPage(({ settings }) => {
  const yoyo = () => {
    console.log("fetch", fetch);
  };

  return <Page>
    {/* <Section title={<Text bold align="center">Sensing</Text>}>
      <TextInput
        label="Send frequency[sec] (Default: 10 seconds)"
        settingsKey="sendFrequencySec"
      />
    </Section> */}

    <Section title={<Text bold align="center">Authentication</Text>}>
      <Text>Log in to your OpenKen account here, and create an access token <Link source="https://open-ken.web.app/access_token">here</Link></Text>
      <TextInput
        label="then copy it here:"
        settingsKey="accessToken"
      />
    </Section>

  </Page >
});
