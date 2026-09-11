package com.example.qrtime

import android.Manifest
import android.content.pm.PackageManager
import android.os.Bundle
import android.widget.TextView
import androidx.activity.result.contract.ActivityResultContracts
import androidx.appcompat.app.AppCompatActivity
import androidx.camera.core.CameraSelector
import androidx.camera.core.ImageAnalysis
import androidx.camera.core.Preview
import androidx.camera.lifecycle.ProcessCameraProvider
import androidx.camera.view.PreviewView
import androidx.core.content.ContextCompat
import com.google.mlkit.vision.barcode.BarcodeScanning
import com.google.mlkit.vision.common.InputImage
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone
import java.util.concurrent.Executors

class MainActivity : AppCompatActivity() {

    private lateinit var previewView: PreviewView
    private lateinit var dateText: TextView
    private lateinit var timeText: TextView
    private lateinit var statusText: TextView

    private val cameraExecutor = Executors.newSingleThreadExecutor()
    private var handled = false

    private val permissionLauncher =
        registerForActivityResult(ActivityResultContracts.RequestPermission()) { granted ->
            if (granted) startCamera()
            else statusText.text = "Camera permission is required."
        }

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        previewView = findViewById(R.id.previewView)
        dateText = findViewById(R.id.dateText)
        timeText = findViewById(R.id.timeText)
        statusText = findViewById(R.id.statusText)

        if (ContextCompat.checkSelfPermission(this, Manifest.permission.CAMERA)
            == PackageManager.PERMISSION_GRANTED) {
            startCamera()
        } else {
            permissionLauncher.launch(Manifest.permission.CAMERA)
        }
    }

    private fun startCamera() {
        val providerFuture = ProcessCameraProvider.getInstance(this)

        providerFuture.addListener({
            val provider = providerFuture.get()

            val preview = Preview.Builder().build().also {
                it.surfaceProvider = previewView.surfaceProvider
            }

            val analysis = ImageAnalysis.Builder()
                .setBackpressureStrategy(ImageAnalysis.STRATEGY_KEEP_ONLY_LATEST)
                .build()

            val scanner = BarcodeScanning.getClient()

            analysis.setAnalyzer(cameraExecutor) { imageProxy ->
                val mediaImage = imageProxy.image

                if (mediaImage == null || handled) {
                    imageProxy.close()
                    return@setAnalyzer
                }

                val image = InputImage.fromMediaImage(
                    mediaImage,
                    imageProxy.imageInfo.rotationDegrees
                )

                scanner.process(image)
                    .addOnSuccessListener { barcodes ->
                        for (barcode in barcodes) {
                            val raw = barcode.rawValue ?: continue

                            if (raw.startsWith("http://") || raw.startsWith("https://")) {
                                handled = true
                                runOnUiThread {
                                    statusText.text = "✓ Opening result page..."
                                    try {
                                        val intent = android.content.Intent(
                                            android.content.Intent.ACTION_VIEW,
                                            android.net.Uri.parse(raw)
                                        )
                                        startActivity(intent)
                                    } catch (e: Exception) {
                                        statusText.text = "Could not open URL: ${e.message}"
                                        handled = false
                                    }
                                }
                                break
                            } else if (raw.startsWith("QRTIME|")) {
                                handled = true
                                showTimeFromQr(raw)
                                break
                            }
                        }
                    }
                    .addOnCompleteListener {
                        imageProxy.close()
                    }
            }

            provider.unbindAll()
            provider.bindToLifecycle(
                this,
                CameraSelector.DEFAULT_BACK_CAMERA,
                preview,
                analysis
            )
        }, ContextCompat.getMainExecutor(this))
    }

    private fun showTimeFromQr(payload: String) {
        val parts = payload.split("|")

        // Expected:
        // QRTIME|WATCH001|2026-09-12T01:40:00+05:30
        if (parts.size < 3) {
            statusText.text = "Invalid QR Time code"
            handled = false
            return
        }

        val timestamp = parts[2]
        val deviceId = parts[1]

        val parsed = try {
            SimpleDateFormat(
                "yyyy-MM-dd'T'HH:mm:ssXXX",
                Locale.US
            ).parse(timestamp)
        } catch (_: Exception) {
            null
        }

        runOnUiThread {
            if (parsed != null) {
                val dateFormat = SimpleDateFormat(
                    "EEEE, dd MMMM yyyy",
                    Locale.US
                )
                val timeFormat = SimpleDateFormat(
                    "HH:mm:ss",
                    Locale.US
                )

                dateText.text = dateFormat.format(parsed)
                timeText.text = timeFormat.format(parsed)
                statusText.text = "✓ Scanned from $deviceId"
            } else {
                statusText.text = "Could not read date/time"
            }
        }
    }

    override fun onResume() {
        super.onResume()
        handled = false
    }

    override fun onDestroy() {
        cameraExecutor.shutdown()
        super.onDestroy()
    }
}
