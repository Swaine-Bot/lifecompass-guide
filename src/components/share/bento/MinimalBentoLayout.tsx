import type { ShareTemplateProps } from '../templates/types';
import { AdaptiveBentoTemplate } from './AdaptiveBentoTemplate';

export function MinimalBentoLayout(props: ShareTemplateProps) {
  return <AdaptiveBentoTemplate baseVariant="minimal" {...props} />;
}
