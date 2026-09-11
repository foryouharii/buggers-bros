package com.example.qrtimewear

import android.graphics.Bitmap
import android.os.Bundle
import android.widget.ImageView
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import com.google.zxing.BarcodeFormat
import com.google.zxing.EncodeHintType
import com.google.zxing.MultiFormatWriter
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.TimeZone

class MainActivity : AppCompatActivity() {

    private val watchId = "WATCH001"

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        val qrImage = findViewById<ImageView>(R.id.qrImage)
        val timeText = findViewById<TextView>(R.id.timeText)

        val now = Date()

        val isoFormat = SimpleDateFormat(
            "yyyy-MM-dd'T'HH:mm:ssXXX",
            Locale.US
        )

        val displayFormat = SimpleDateFormat(
            "HH:mm:ss",
            Locale.US
        )

        isoFormat.timeZone = TimeZone.getTimeZone("Asia/Kolkata")
        displayFormat.timeZone = TimeZone.getTimeZone("Asia/Kolkata")

        val payload = "QRTIME|$watchId|${isoFormat.format(now)}"

        qrImage.setImageBitmap(createQr(payload, 190))
        timeText.text = displayFormat.format(now)
    }

    private fun createQr(text: String, size: Int): Bitmap {
        val hints = mapOf(
            EncodeHintType.MARGIN to 1,
            EncodeHintType.CHARACTER_SET to "UTF-8"
        )

        val matrix = MultiFormatWriter().encode(
            text,
            BarcodeFormat.QR_CODE,
            size,
            size,
            hints
        )

        val pixels = IntArray(size * size)

        for (y in 0 until size) {
            for (x in 0 until size) {
                pixels[y * size + x] =
                    if (matrix[x, y]) 0xFF000000.toInt()
                    else 0xFFFFFFFF.toInt()
            }
        }

        return Bitmap.createBitmap(
            pixels,
            size,
            size,
            Bitmap.Config.ARGB_8888
        )
    }
}
