import { useRouter } from "next/router";

export default function StreamPage() {
    const router = useRouter();
    const { filename } = router.query;

    if (!filename) {
        return <p>Loading...</p>;
    }

    // Wasabi file URL
    const fileUrl = `https://s3.us-east-1.wasabisys.com/telebot1/${filename}`;

    return (
        <div style={{ textAlign: "center", marginTop: "50px" }}>
            <h2>Streaming: {filename}</h2>
            <video width="80%" controls>
                <source src={fileUrl} type="video/mp4" />
                Your browser does not support the video tag.
            </video>
        </div>
    );
}
