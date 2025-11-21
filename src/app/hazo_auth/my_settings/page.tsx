// file_description: render the my settings page shell and mount the my settings layout component within sidebar
// section: imports
import { AuthPageShell } from "../../../components/layouts/shared/components/auth_page_shell";
import { MySettingsPageClient } from "./my_settings_page_client";
import { get_my_settings_config } from "../../../lib/my_settings_config.server";

// section: component
export default function my_settings_page() {
  // Read my settings configuration from hazo_auth_config.ini (server-side)
  const mySettingsConfig = get_my_settings_config();

  return (
    <AuthPageShell>
      <MySettingsPageClient
        userFields={mySettingsConfig.userFields}
        passwordRequirements={mySettingsConfig.passwordRequirements}
        profilePicture={mySettingsConfig.profilePicture}
        heading={mySettingsConfig.heading}
        subHeading={mySettingsConfig.subHeading}
        profilePhotoLabel={mySettingsConfig.profilePhotoLabel}
        profilePhotoRecommendation={mySettingsConfig.profilePhotoRecommendation}
        uploadPhotoButtonLabel={mySettingsConfig.uploadPhotoButtonLabel}
        removePhotoButtonLabel={mySettingsConfig.removePhotoButtonLabel}
        profileInformationLabel={mySettingsConfig.profileInformationLabel}
        passwordLabel={mySettingsConfig.passwordLabel}
        currentPasswordLabel={mySettingsConfig.currentPasswordLabel}
        newPasswordLabel={mySettingsConfig.newPasswordLabel}
        confirmPasswordLabel={mySettingsConfig.confirmPasswordLabel}
        savePasswordButtonLabel={mySettingsConfig.savePasswordButtonLabel}
        unauthorizedMessage={mySettingsConfig.unauthorizedMessage}
        loginButtonLabel={mySettingsConfig.loginButtonLabel}
        loginPath={mySettingsConfig.loginPath}
        messages={mySettingsConfig.messages}
        uiSizes={mySettingsConfig.uiSizes}
        fileTypes={mySettingsConfig.fileTypes}
      />
    </AuthPageShell>
  );
}

