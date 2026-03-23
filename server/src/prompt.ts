const COMPONENTS_ROOT = process.env.COMPONENTS_ROOT || 'src/components';

const COMPONENT_INVENTORY = `
- NavigationPanel | props: items?: NavItem[], activeId?: string, userName?: string, userPlan?: string, onNavigate?: (id: string) => void | import: '../NavigationPanel/NavigationPanel.tsx'
- SearchBar | props: placeholder?: string, value?: string, state?: 'idle'|'focused'|'disabled', onChange?, onSubmit? | import: '../SearchBar/SearchBar.tsx'
- Tag | props: label: string, showChevron?: boolean, icon?: ReactNode, onClick? | import: '../Tag/Tag.tsx'
- CardKpi | props: title?: string, icon?: CategoryIconType ('wallet'|'home'|'shield'|'savings'|'file-text'|'mail'|'headset'), kpiValue?: string, kpiLabel?: string, trend?: string, trendDirection?: 'positive'|'negative', ctaLabel?: string, children?: ReactNode | import: '../CardKpi/CardKpi.tsx'
- CardInsuranceCoverage | props: title?: string, items?: InsuranceCoverageItem[], onViewAll? | import: '../CardInsuranceCoverage/CardInsuranceCoverage.tsx'
- SideBanner | props: tag?: string, label?: string, kpi?: string, badge?: string, description?: string, hideImage?: boolean | import: '../SideBanner/SideBanner.tsx'
- SummaryItem | props: title?: string, kpi?: string, description?: string, showDescription?: boolean | import: '../SummaryItem/SummaryItem.tsx'
- InsightBanner | props: text?: string, actionLabel?: string, onAction? | import: '../InsightBanner/InsightBanner.tsx'
- InsuranceCard | props: title?: string, icon?: CategoryIconType ('wallet'|'home'|'shield'|'savings'|'file-text'|'mail'|'headset'), provider?: string, coverage?: string, monthlyPremium?: string | import: '../InsuranceCard/InsuranceCard.tsx'
- Button | props: label?: string, state?: ButtonState, leftIcon?: ReactNode, rightIcon?: ReactNode, fullWidth?: boolean | import: '../Button/Button.tsx'
- ButtonIcon | props: icon?: ReactNode, state?: ButtonIconState, 'aria-label'?: string | import: '../ButtonIcon/ButtonIcon.tsx'
- TextButton | props: label?: string, state?: TextButtonState, showChevron?: boolean | import: '../TextButton/TextButton.tsx'
- CategoryIcon | props: icon?: CategoryIconType ('wallet'|'home'|'shield'|'savings'|'file-text'|'mail'|'headset'), size?: number | import: '../CategoryIcon/CategoryIcon.tsx'
- AvatarMember | props: member?: MemberVariant, src?: string, alt?: string | import: '../AvatarMember/AvatarMember.tsx'
- AvatarUser | props: name?: string, member?: MemberVariant, active?: boolean, src?: string | import: '../AvatarUser/AvatarUser.tsx'
- BadgeAvatar | props: icon?: BadgeAvatarIcon ('home'|'wallet'|'shield'|'savings'|'file-text'|'mail'|'headset'), dot?: boolean, fill?: 'yes'|'no' | import: '../BadgeAvatar/BadgeAvatar.tsx'
- BadgeNum | props: count: number|string | import: '../BadgeNum/BadgeNum.tsx'
- TrendBadge | props: value: string, direction?: 'positive'|'negative' | import: '../TrendBadge/TrendBadge.tsx'
- ListItem | props: text?: string, icon?: BadgeAvatarIcon ('home'|'wallet'|'shield'|'savings'|'file-text'|'mail'|'headset'), state?: 'idle'|'selected', showChevron?: boolean, badgeCount?: number | import: '../ListItem/ListItem.tsx'
- Divider | props: className?: string | import: '../Divider/Divider.tsx'
`.trim();

const REFERENCE_EXAMPLE = `
// ── Example: Dashboard.tsx (shows the pattern to follow) ──
import React from 'react';
import styles from './Dashboard.module.css';
import { NavigationPanel } from '../NavigationPanel/NavigationPanel.tsx';
import { SearchBar } from '../SearchBar/SearchBar.tsx';
import { Tag } from '../Tag/Tag.tsx';
import { CardKpi } from '../CardKpi/CardKpi.tsx';
import { SummaryItem } from '../SummaryItem/SummaryItem.tsx';
import { InsightBanner } from '../InsightBanner/InsightBanner.tsx';
import { CardInsuranceCoverage } from '../CardInsuranceCoverage/CardInsuranceCoverage.tsx';
import { SideBanner } from '../SideBanner/SideBanner.tsx';

// Local helper for card slot content
function PensionCardContent() {
  return (
    <div className={styles.pensionContent}>
      <div className={styles.summaryList}>
        <SummaryItem title="Last Deposit" kpi="$4,200" description="November 2024" />
        <SummaryItem title="Est. Monthly" kpi="$8,450" showDescription={false} />
      </div>
      <InsightBanner text="Your fees are high..." actionLabel="Review" />
    </div>
  );
}

export interface DashboardProps {
  userName?: string;
  userFullName?: string;
  userPlan?: string;
  activeNavId?: string;
}

export function Dashboard({ userName = 'David', ... }: DashboardProps) {
  return (
    <div className={styles.layout}>
      <NavigationPanel userName={userFullName} userPlan={userPlan} activeId={activeNavId} />
      <main className={styles.main}>
        <div className={styles.container}>
          <h1 className={styles.heading}>Welcome back, {userName}</h1>
          <SearchBar placeholder="Ask me anything..." />
          <div className={styles.tags}>{TAGS.map(l => <Tag key={l} label={l} />)}</div>
          <div className={styles.kpiRow}>
            <CardKpi title="Pension" ...><PensionCardContent /></CardKpi>
            <CardKpi title="Portfolio" ...><PortfolioCardContent /></CardKpi>
          </div>
          <div className={styles.bottomRow}>
            <CardInsuranceCoverage />
            <SideBanner tag="2025 Wrapped" label="Total Contributions" kpi="$56,200" ... />
          </div>
        </div>
      </main>
    </div>
  );
}

// ── Example: Dashboard.module.css ──
@import '../../styles/tokens.css';
.layout { display: flex; min-height: 100vh; background-color: var(--color-neutral-100); font-family: var(--font); }
.main { flex: 1; min-width: 0; overflow-y: auto; }
.container { display: flex; flex-direction: column; gap: 24px; padding: 24px 24px 40px; }
.heading { margin: 0; font-size: 26px; font-weight: var(--fw-regular); color: var(--color-neutral-900); }
.kpiRow { display: flex; gap: 16px; }
.kpiCard { flex: 1 1 0; min-width: 0; display: flex; }
.bottomRow { display: flex; gap: 16px; align-items: stretch; }

// ── Example: Dashboard.stories.tsx ──
import React from 'react';
import type { Meta, StoryObj } from '@storybook/react-vite';
import { Dashboard } from './Dashboard.tsx';
const meta = { title: 'UI Screens/Dashboard', component: Dashboard, parameters: { layout: 'fullscreen' }, tags: ['autodocs'] } satisfies Meta<typeof Dashboard>;
export default meta;
type Story = StoryObj<typeof meta>;
export const Default: Story = { args: { userName: 'David', userFullName: 'David Levi', userPlan: 'Portfolio ID: 20144874', activeNavId: 'dashboard' } };
`.trim();

export function buildPrompt(
  figmaUrl: string,
  nodeId: string,
  componentName: string,
): string {
  const screenDir = `${COMPONENTS_ROOT}/${componentName}`;
  const componentFile = `${screenDir}/${componentName}.tsx`;
  const cssFile = `${screenDir}/${componentName}.module.css`;
  const storyFile = `${screenDir}/${componentName}.stories.tsx`;

  return `You are working inside a Storybook project. Turn a Figma layout into a screen component.

## Step 1 — Read the Figma layout

Call the mcp__plugin_figma_figma__get_design_context tool with these EXACT parameters:
  fileKey: "${figmaUrl.match(/\/design\/([^/]+)/)?.[1] || 'UNKNOWN'}"
  nodeId: "${nodeId}"
Study the screenshot to understand the spatial arrangement and which components are used.

## Step 2 — Available components

These components exist in the project. Use ONLY these — do NOT create new ones:

${COMPONENT_INVENTORY}

## Step 3 — Write 3 files

Using the Write tool, create these files:

**${componentFile}** — React screen component
- Compose the components from step 2 to match the Figma layout
- CSS modules for layout: import styles from './${componentName}.module.css'
- Props interface for configurable values (user name, active nav, etc.)
- Constants for decorative data (KPI numbers, fund lists, etc.)
- Local helper components for card slot content (children)

**${cssFile}** — CSS module (layout only)
- Start with: @import '../../styles/tokens.css';
- Use CSS vars from tokens (--color-neutral-*, --font, --fw-*)
- Flexbox/grid for layout. Do NOT style child components.

**${storyFile}** — Storybook story
- CSF3 + TypeScript, import Meta/StoryObj from '@storybook/react-vite'
- title: 'UI Screens/${componentName}', parameters: { layout: 'fullscreen' }
- tags: ['autodocs'], at least one story with default args

## Reference pattern

${REFERENCE_EXAMPLE}

## Rules
- Import ONLY from existing components listed above
- No inline styles, no Tailwind — CSS modules only
- Relative imports (e.g. '../Button/Button.tsx')
- File header: // Auto-generated by Figma → Storybook pipeline
- If a Figma element has no matching component, skip with a TODO comment`;
}
