
"use client";

export function MapEmbed() {
    return (
        <div className="w-full h-full min-h-[400px] rounded-2xl overflow-hidden shadow-sm border border-gray-100 bg-gray-50">
            <iframe
                src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d117924.89860408542!2d82.9056294!3d22.0229357!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a20a4b434afbb87%3A0xc3dd69b007270f9b!2sSakti%2C%20Chhattisgarh%20495689!5e0!3m2!1sen!2sin!4v1705650000000!5m2!1sen!2sin"
                width="100%"
                height="100%"
                style={{ border: 0, minHeight: "400px" }}
                allowFullScreen={false}
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
            ></iframe>
        </div>
    );
}
