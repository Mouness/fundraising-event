# design & Branding

The platform offers powerful tools to customize the look and feel of your event, ensuring it aligns with your organization's identity.

## Branding Strategy

When configuring an event's branding, you have two primary options:

1.  **Use Global Branding (Recommended)**: The event will automatically inherit the logo, colors, and legal information configured in the global Organization Settings. This ensures consistency across all your campaigns.
2.  **Custom Branding**: Uncheck "Use Organization Branding" to define unique assets for a specific event. This is useful for special campaigns with their own visual identity.

## Identity & Assets

If you choose **Custom Branding**, you can configure:

-   **Event Display Title**: Overrides the internal event name on public pages.
-   **Logo URL**: The logo displayed in the header of the landing page and live screen.
-   **Landing Background**: The background image for the donation page.
-   **Live Screen Background**: The background image for the real-time dashboard.

![Event Branding Settings](../assets/event_settings_branding_top.png)

> [!TIP]
> **Relative Paths**: For internal assets hosted on the platform, you can use relative paths like `/assets/images/my-bg.jpg` instead of full URLs.

## Landing Page Configuration

The event landing page features three optional content blocks that can be linked to external resources. You can enable/disable these and set their destination URLs.

### Feature Boxes
-   **Impact Box**: Highlights the cause.
-   **Community Box**: Connects donors.
-   **Interactive Box**: Promotes the live screen experience.

### Configuration
In the **Event Settings > Design & Branding** section:
1.  **Enable/Disable**: Use the toggle switch next to each box name to show or hide it on the landing page.
2.  **Destination URL**: Enter the URL where the user should be taken when they click the box.
    -   *Example*: `https://www.ocean-cleanup.org/impact`
    -   *Internal Link*: `/ocean-cleanup-2025/live`

![Branding Settings](../assets/branding_settings.png)

> [!NOTE]
> The landing page usage a dynamic grid layout. It will automatically adjust from 3 columns to 2 or 1 column depending on how many boxes you have enabled.

## Technical Internals

For developers or advanced administrators looking to understand the underlying configuration structure (JSON schema, TypeScript interfaces) of the white-labeling system, please refer to the technical documentation.

[Read Technical White-Labeling Guide](../../technical/white-labeling.md)

## Live Page Theme

Customize the appearance of the real-time donation display (`/live` page).

-   **Theme Selection**:
    -   `Classic` (Default): Clean and professional.
    -   `Modern`: Bold typography and high contrast.
    -   `Elegant`: Serif fonts and gold accents, perfect to galas.

## CSS Overrides

For advanced users, you can inject custom CSS variables to fine-tune the color palette.
-   Click **"Add Variable"**.
-   **Key**: e.g., `--primary`
-   **Value**: e.g., `#ff4500`
