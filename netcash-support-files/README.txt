NETCASH BATCH FILES FOR SUPPORT REVIEW
Generated: 2026-02-13T08:36:42.692Z

ISSUE:
Receiving error code 100 (Authentication failure) when uploading batch file.

ACCOUNT DETAILS:
- Merchant ID: 51498414802
- Account Name: Wabi Sabi Systems (Test)
- Service Key: 657eb988-5345-45f7-a5e5-07a1a586155f
- Account Status: Active pending

FILES INCLUDED:
1. NETCASH_REVIEW_1770971802689.txt - Batch file using EXACT official format
2. NETCASH_REVIEW_1770971802689_SOAP.xml - SOAP envelope used for upload

VERIFICATION COMPLETED:
✅ Service key in batch file matches service key in SOAP header
✅ Batch format matches official example provided by support
✅ TAB-delimited format confirmed
✅ CRLF line endings confirmed
✅ Key record has 14 fields (101, 102, 131-137, 162, 201, 301-303)
✅ Transaction record has 15 fields matching official example

BATCH FILE CONTENT:
H	657eb988-5345-45f7-a5e5-07a1a586155f	1	TwoDay	NETCASH_REVIEW_1770971802689	20250220	24ade73c-98cf-47b3-99be-cc7b867b3080
K	101	102	131	132	133	134	135	136	137	162	201	301	302	303
T	testy1	Test Account	1	Test Account	2	632005	0	123456789		50000	test@example.com	D1BOU	BOU10001	2025-02-20
F	1	50000	9999

SOAP ENVELOPE:
<?xml version="1.0" encoding="utf-8"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema">
  <soap:Body>
    <BatchFileUpload xmlns="http://tempuri.org/">
      <ServiceKey>657eb988-5345-45f7-a5e5-07a1a586155f</ServiceKey>
      <File>SAk2NTdlYjk4OC01MzQ1LTQ1ZjctYTVlNS0wN2ExYTU4NjE1NWYJMQlUd29EYXkJTkVUQ0FTSF9SRVZJRVdfMTc3MDk3MTgwMjY4OQkyMDI1MDIyMAkyNGFkZTczYy05OGNmLTQ3YjMtOTliZS1jYzdiODY3YjMwODANCksJMTAxCTEwMgkxMzEJMTMyCTEzMwkxMzQJMTM1CTEzNgkxMzcJMTYyCTIwMQkzMDEJMzAyCTMwMw0KVAl0ZXN0eTEJVGVzdCBBY2NvdW50CTEJVGVzdCBBY2NvdW50CTIJNjMyMDA1CTAJMTIzNDU2Nzg5CQk1MDAwMAl0ZXN0QGV4YW1wbGUuY29tCUQxQk9VCUJPVTEwMDAxCTIwMjUtMDItMjANCkYJMQk1MDAwMAk5OTk5</File>
    </BatchFileUpload>
  </soap:Body>
</soap:Envelope>

REQUEST:
Please review these files and advise on the error 100 issue.
Is the account activation status the cause?
