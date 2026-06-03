import fs from 'node:fs';
import { auditDiataxisFiles, renderDiataxisReport } from './diataxis_folder_audit.mjs';

const DIATAXIS_PREFIXES = [
	'docs/tutorials/',
	'docs/how-to/',
	'docs/reference/',
	'docs/explanation/',
];

export function isDiataxisDocPath(filePath = '') {
	return DIATAXIS_PREFIXES.some((prefix) => filePath.startsWith(prefix)) && filePath.endsWith('.md');
}

export function filterDiataxisChangedFiles(files = []) {
	return files
		.map((file) => (typeof file === 'string' ? file : file.filename || file.path))
		.filter((file) => isDiataxisDocPath(file));
}

export function auditMergedDiataxisDocs({ files = [], root = '.' } = {}) {
	const changedFiles = filterDiataxisChangedFiles(files);
	const findings = auditDiataxisFiles(changedFiles, { root });
	return {
		changed_files: changedFiles,
		findings,
		report: renderDiataxisReport(findings),
	};
}

export function diataxisEvidenceFailures({ files = [], root = '.' } = {}) {
	const audit = auditMergedDiataxisDocs({ files, root });
	return audit.findings.map((finding) => ({
		code: `diataxis_${finding.code.toLowerCase()}`,
		message: `${finding.file}: ${finding.message}`,
		file: finding.file,
		correction: finding.correction,
	}));
}

export function writeDiataxisAuditArtifacts(audit, {
	jsonPath = 'post-merge-diataxis.json',
	markdownPath = 'post-merge-diataxis.md',
} = {}) {
	fs.writeFileSync(jsonPath, `${JSON.stringify(audit, null, 2)}\n`);
	fs.writeFileSync(markdownPath, `${audit.report || 'No DIATAXIS docs changed.'}\n`);
}

export function runDiataxisAuditCli(env = process.env) {
	const changedFilesPath = env.DIATAXIS_CHANGED_FILES_FILE;
	const files = changedFilesPath && fs.existsSync(changedFilesPath)
		? fs.readFileSync(changedFilesPath, 'utf8').split(/\r?\n/).filter(Boolean)
		: [];
	const audit = auditMergedDiataxisDocs({ files, root: env.DIATAXIS_ROOT || '.' });
	writeDiataxisAuditArtifacts(audit);
	console.log(audit.report);
	return audit.findings.length;
}

if (import.meta.url === `file://${process.argv[1]}`) {
	process.exitCode = runDiataxisAuditCli() > 0 ? 1 : 0;
}
