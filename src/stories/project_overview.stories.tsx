// file_description: provide a high level story describing the purpose of the hazo_auth workspace
import type { Meta, StoryObj } from "@storybook/nextjs";

// section: story_configuration
const story_meta: Meta = {
  title: "foundations/project_overview",
  parameters: {
    layout: "centered",
  },
};

export default story_meta;

type Story = StoryObj;

// section: story_definitions
export const DefaultView: Story = {
  name: "workspace overview",
  render: () => (
    <div className="cls_story_overview flex max-w-xl flex-col items-center justify-center gap-4 rounded-lg border border-slate-200 bg-white p-8 text-center shadow-sm">
      <h2 className="cls_story_heading text-2xl font-semibold text-slate-900">
        build reusable components with confidence
      </h2>
      <p className="cls_story_body text-base leading-relaxed text-slate-600">
        This Storybook workspace pairs shadcn primitives with hazo_config and
        hazo_connect so the design system can stay aligned with platform
        standards. Add new stories to document upcoming components as
        requirements arrive.
      </p>
    </div>
  ),
};

