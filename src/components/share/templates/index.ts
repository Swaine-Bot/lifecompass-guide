export { ClassicTemplate } from './ClassicTemplate';
export { StoryTemplate } from './StoryTemplate';
export { MinimalTemplate } from './MinimalTemplate';
export { MomentumTemplate } from './MomentumTemplate';
export { MediaSpotlightTemplate } from './MediaSpotlightTemplate';
export { ReflectionTemplate } from './ReflectionTemplate';
export { TEMPLATE_REGISTRY, suggestTemplate } from './types';
export type { ShareTemplateName, ShareTemplateProps, TemplateMetadata } from './types';

import type { ShareTemplateName } from './types';
import { ClassicTemplate } from './ClassicTemplate';
import { StoryTemplate } from './StoryTemplate';
import { MinimalTemplate } from './MinimalTemplate';
import { MomentumTemplate } from './MomentumTemplate';
import { MediaSpotlightTemplate } from './MediaSpotlightTemplate';
import { ReflectionTemplate } from './ReflectionTemplate';
import type { ShareTemplateProps } from './types';
import type { FC } from 'react';

export const TEMPLATE_COMPONENTS: Record<ShareTemplateName, FC<ShareTemplateProps>> = {
  classic: ClassicTemplate,
  story: StoryTemplate,
  minimal: MinimalTemplate,
  momentum: MomentumTemplate,
  media_spotlight: MediaSpotlightTemplate,
  reflection: ReflectionTemplate,
};
