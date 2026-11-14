import Foundation
import Vision
import AppKit

let root = URL(fileURLWithPath: CommandLine.arguments[1])
let manifest = try JSONSerialization.jsonObject(with: Data(contentsOf: root.appendingPathComponent("research/screenshot-manifest.json"))) as! [[String: Any]]
var output: [[String: Any]] = []
for item in manifest {
    let url = root.appendingPathComponent(item["path"] as! String)
    let image = NSImage(contentsOf: url)!
    var rect = CGRect(origin: .zero, size: image.size)
    let cg = image.cgImage(forProposedRect: &rect, context: nil, hints: nil)!
    let scale = cg.width < 1000 ? 3 : 2
    let context = CGContext(data: nil, width: cg.width * scale, height: cg.height * scale, bitsPerComponent: 8, bytesPerRow: 0, space: CGColorSpaceCreateDeviceRGB(), bitmapInfo: CGImageAlphaInfo.premultipliedLast.rawValue)!
    context.interpolationQuality = .high
    context.draw(cg, in: CGRect(x: 0, y: 0, width: cg.width * scale, height: cg.height * scale))
    let enlarged = context.makeImage()!
    let request = VNRecognizeTextRequest()
    request.recognitionLevel = .accurate
    request.recognitionLanguages = ["ko-KR", "en-US"]
    request.usesLanguageCorrection = true
    request.customWords = ["규칙.md", "시종.md", "기획안.md", "콘티.md", "그래프.md", "자료요약.md", "핵심요약", "쟁점", "출처", "국무회의록", "차관회의록", "클로드", "Markdown", "폴더", "결과", "템플릿", "정책자료", "완내스"]
    try VNImageRequestHandler(cgImage: enlarged).perform([request])
    let lines = (request.results ?? []).compactMap { observation -> [String: Any]? in
        guard let text = observation.topCandidates(1).first else { return nil }
        let b = observation.boundingBox
        return ["text": text.string, "confidence": text.confidence, "x": b.minX, "y": 1-b.maxY, "w": b.width, "h": b.height]
    }
    output.append(["id": item["id"]!, "width": cg.width, "height": cg.height, "labels": item["labels"]!, "lines": lines])
    if output.count % 20 == 0 { print("Recognized \(output.count)/\(manifest.count)") }
}
let data = try JSONSerialization.data(withJSONObject: output, options: [.prettyPrinted, .sortedKeys])
try data.write(to: root.appendingPathComponent("research/screenshot-text.json"))
print("Saved \(output.count) screenshot text records")
