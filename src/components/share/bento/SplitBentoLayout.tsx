import type { ShareTemplateProps } from '../templates/types';
import { AdaptiveBentoTemplate } from './AdaptiveBentoTemplate';

export function SplitBentoLayout(props: ShareTemplateProps) {
  return <AdaptiveBentoTemplate baseVariant="split" {...props} />;
}
