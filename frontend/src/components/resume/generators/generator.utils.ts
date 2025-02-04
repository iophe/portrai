import { jsPDF } from "jspdf";
import html2canvas from "html2canvas-pro";

interface GeneratePDFCfg {
	background_color?: string;
	width?: number;
	orientation?: "portrait" | "p" | "l" | "landscape";
	unit?: "mm" | "pt" | "px" | "in" | "cm" | "ex" | "em" | "pc";
	format?: string;
	name: string;
}

export async function generatePDF(ref: HTMLElement, cfg: GeneratePDFCfg) {
	const canvas = await html2canvas(ref, {
		scale: 2,
		logging: false,
		useCORS: true,
		allowTaint: true,
		backgroundColor: cfg.background_color ?? "#ffffff",
		removeContainer: true,
	});

	const img_width = cfg.width ?? 210; // defaulted to A4 width in mm
	const pixel_ratio = canvas.width / canvas.height;
	const img_height = img_width / pixel_ratio;

	const pdf = new jsPDF({
		orientation: cfg.orientation ?? "portrait",
		unit: cfg.unit ?? "mm",
		format: cfg.format ?? "a4",
		compress: true,
	});

	const img_data = canvas.toDataURL("image/jpeg", 1.0);
	pdf.addImage(img_data, "JPEG", 0, 0, img_width, img_height);
	pdf.save(cfg.name);
}
