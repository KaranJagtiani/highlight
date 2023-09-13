import { IntegrationStatus } from '@graph/schemas'
import {
	Box,
	ButtonIcon,
	Heading,
	IconSolidCheveronDown,
	IconSolidCheveronUp,
	Stack,
} from '@highlight-run/ui'
import { CodeBlock } from '@pages/Setup/CodeBlock/CodeBlock'
import { Header } from '@pages/Setup/Header'
import analytics from '@util/analytics'
import clsx from 'clsx'
import { QuickStartContent, quickStartContent } from 'highlight.io'
import * as React from 'react'
import ReactMarkdown from 'react-markdown'
import { useMatch } from 'react-router-dom'

import * as styles from './SetupDocs.css'

export type OptionListItem = {
	key: string
	name: string
	imageUrl: string
	path: string
}

type Props = {
	projectVerboseId: string
	backendUrl: string
	integrationData?: IntegrationStatus
}

export const SetupDocs: React.FC<Props> = ({
	projectVerboseId,
	backendUrl,
}) => {
	const match = useMatch('/:project_id/setup/:area/:language/:framework')
	const { area, framework, language } = match!.params
	const guide = (quickStartContent as any)[area!][language!][
		framework!
	] as QuickStartContent

	const replacements = [
		['<YOUR_PROJECT_ID>', projectVerboseId],
		['<YOUR_BACKEND_URL>', backendUrl],
	]

	if (backendUrl !== 'https://pub.highlight.io') {
		// Remove last element since we need to remove the entire line
		replacements.pop()

		// For Angular, Vue, SvelteKit, React, HTML/JS
		replacements.push([
			"[\r\n]+[ \t]*backendUrl: '<YOUR_BACKEND_URL>',",
			'',
		])

		// For Next
		replacements.push([
			"[\r\n]+[ \t]*backendUrl={'<YOUR_BACKEND_URL>'}",
			'',
		])

		// For Remix
		replacements.push([
			'[\r\n]+[ \t]*HIGHLIGHT_BACKEND_URL: process.env.HIGHLIGHT_BACKEND_URL,',
			'',
		])
		replacements.push([
			'[\r\n]+[ \t]*backendUrl={ENV.HIGHLIGHT_BACKEND_URL}',
			'',
		])
	}

	return (
		<Box>
			<Box style={{ maxWidth: 560 }} my="40" mx="auto">
				<Header title={guide.title} subtitle={guide.subtitle} />

				<Stack gap="8" py="10">
					{guide.entries.map((entry, index) => {
						return (
							<Section
								title={entry.title}
								key={index}
								defaultOpen
							>
								<ReactMarkdown>{entry.content}</ReactMarkdown>
								<Stack gap="4">
									{entry.code?.map((codeBlock) => (
										<CodeBlock
											key={codeBlock.key}
											language={codeBlock.language}
											onCopy={() => {
												analytics.track(
													'Copied Setup Code',
													{
														copied: 'script',
														language:
															codeBlock.language,
													},
												)
											}}
											text={replacements.reduce(
												(acc, [search, replace]) => {
													return acc.replace(
														new RegExp(search, 'g'),
														replace,
													)
												},
												codeBlock.text,
											)}
											className={clsx(styles.codeBlock)}
											customStyle={{}} // removes unwanted bottom padding
										/>
									))}
								</Stack>
							</Section>
						)
					})}
				</Stack>
			</Box>
		</Box>
	)
}

type SectionProps = {
	title: string | React.ReactNode
	defaultOpen?: boolean
}

export const Section: React.FC<React.PropsWithChildren<SectionProps>> = ({
	children,
	title,
	defaultOpen,
}) => {
	const [open, setOpen] = React.useState(!!defaultOpen)

	return (
		<Box
			border="secondary"
			borderRadius="8"
			px="16"
			pt="24"
			pb={open ? '16' : '24'}
			boxShadow="small"
		>
			<Box position="relative" pr="40">
				<Heading level="h4">{title}</Heading>
				<ButtonIcon
					className={styles.sectionToggle}
					kind="secondary"
					emphasis="low"
					onClick={() => setOpen(!open)}
					icon={
						open ? (
							<IconSolidCheveronDown />
						) : (
							<IconSolidCheveronUp />
						)
					}
				/>
			</Box>

			{open && <Box mt="24">{children}</Box>}
		</Box>
	)
}
