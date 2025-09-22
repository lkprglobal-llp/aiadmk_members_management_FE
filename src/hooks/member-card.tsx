import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { QRCodeCanvas } from "qrcode.react";
import React from "react";
import { Member } from "@/services/api";


interface MemberCardProps {
    member: Member;
}
const BASE_URL = "http://localhost:5253/"; // Update this with your backend URL
const MemberCard: React.FC<MemberCardProps> = ({ member }) => {
    const downloadPDF = async () => {
        const frontEl = document.getElementById("card-front");
        const backEl = document.getElementById("card-back");
        if (!frontEl || !backEl) return;

        // Capture front
        const frontCanvas = await html2canvas(frontEl, { scale: 2 });
        const frontImg = frontCanvas.toDataURL("image/png");

        // Capture back
        const backCanvas = await html2canvas(backEl, { scale: 2 });
        const backImg = backCanvas.toDataURL("image/png");

        // ID card size (85mm x 54mm)
        const cardWidth = 85 * 2.835; // 241 pt
        const cardHeight = 54 * 2.835; // 153 pt

        const pdf = new jsPDF("l", "pt", [cardWidth, cardHeight]);

        // Add front
        pdf.addImage(frontImg, "PNG", 0, 0, cardWidth, cardHeight);

        // Add new page for back
        pdf.addPage([cardWidth, cardHeight], "l");
        pdf.addImage(backImg, "PNG", 0, 0, cardWidth, cardHeight);

        pdf.save(`member_${member.id}.pdf`);
    };

    return (
        <div className="flex flex-col items-center">
            {/* Download button */}
            <button
                onClick={downloadPDF}
                className="bg-green-600 text-white px-4 py-2 rounded-lg mb-4"
            >
                Download PDF (Front & Back)
            </button>

            {/* FRONT SIDE */}
            <div
                id="card-front"
                className="w-[340px] h-[216px] border rounded-lg shadow-xl bg-white relative overflow-hidden mb-6"
            >
                {/* Header */}
                <div className="flex items-center bg-green-700 text-white px-3 py-2">
                    <img src="/logo.png" alt="Logo" className="w-10 h-10 mr-2" />
                    <h2 className="font-bold text-lg">AIADMK Membership</h2>
                </div>

                {/* Body */}
                <div className="flex p-3 gap-3">
                    {/* Photo */}
                    <div className="w-20 h-20 rounded-full border overflow-hidden flex-shrink-0">
                        {member.image ? (
                            <img
                                src={`${BASE_URL}${member.image}`}
                                alt={member.name}
                                className="object-cover w-full h-full"
                            />
                        ) : (
                            <span className="text-xs text-gray-400 flex items-center justify-center h-full">
                                No Image
                            </span>
                        )}
                    </div>

                    {/* Info */}
                    <div className="text-xs grid grid-cols-2 gap-x-3 gap-y-1">
                        <p>
                            <strong>ID:</strong> {member.id}
                        </p>
                        <p>
                            <strong>Name:</strong> {member.name}
                        </p>
                        <p>
                            <strong>Father:</strong> {member.parents_name}
                        </p>
                        <p>
                            <strong>DOB:</strong> {member.date_of_birth}
                        </p>
                        <p>
                            <strong>Mobile:</strong> {member.mobile}
                        </p>
                        <p>
                            <strong>Voter ID:</strong> {member.voter_id}
                        </p>
                    </div>
                </div>

                {/* Footer */}
                <div className="absolute bottom-0 left-0 right-0 bg-gray-100 text-center text-[10px] py-1">
                    <p>{member.jname} • {member.tname} • {member.dname}</p>
                </div>
            </div>

            {/* BACK SIDE */}
            <div
                id="card-back"
                className="w-[340px] h-[216px] border rounded-lg shadow-xl bg-gray-50 relative overflow-hidden"
            >
                <div className="flex justify-between p-3">
                    <div className="text-xs leading-4">
                        <p><strong>Address:</strong> {member.address}</p>
                        <p><strong>Phone:</strong> {member.mobile}</p>

                        {/* QR Code */}
                        <QRCodeCanvas
                            value={`MemberID: ${member.id}, Name: ${member.name}`}
                            size={80}
                            className="self-center"
                        />
                    </div>

                    {/* Footer */}
                    <div className="absolute bottom-0 left-0 right-0 bg-green-700 text-white text-center text-[10px] py-1">
                        <p>Official AIADMK Membership Card</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MemberCard;
