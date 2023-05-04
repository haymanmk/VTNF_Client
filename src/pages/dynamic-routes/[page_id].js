import { Box, Card, Container, List, Typography, Divider } from "@mui/material";
import Head from "next/head";
import { useRouter } from "next/router";
import { settings } from "nprogress";
import { useEffect } from "react";
import { SettingItems } from "../../components/setting-items";

const DynamicRoutes = () => {
  const router = useRouter();
  const { page_id } = router.query;

  return (
    <>
      <Head>
        <title>{page_id} | VTNF</title>
      </Head>
      <Box component="main" sx={{ flexGrow: 1, py: 8 }}>
        <Container maxWidth="md" sx={{ mb: 3 }}>
          <Typography variant="h4" sx={{ mb: 2 }}>
            {title}
          </Typography>
          <Card>
            <List>
              {Object.keys(settings).map((key, index) => (
                <>
                  {index > 0 && <Divider />}
                  <SettingItems
                    key={key}
                    id={key}
                    label={settings[key].label}
                    description={settings[key].description}
                    value={settings[key].value}
                    // handleChange={}
                  />
                </>
              ))}
            </List>
          </Card>
        </Container>
      </Box>
    </>
  );
};

export default DynamicRoutes;
