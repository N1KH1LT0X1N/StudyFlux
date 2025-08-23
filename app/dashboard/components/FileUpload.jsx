import {Buffer} from 'buffer';

function FileUpload({setFile}) {

    async function handleFileUpload(event){
      const fileUpload = await event.target.files[0].arrayBuffer();
      const file = {
        type: event.target.files[0].type,
        file: Buffer.from(fileUpload).toString("base64"),
        imageUrl: event.target.files[0].type.includes("pdf") ? "/document-icon.png" : URL.createObjectURL(event.target.files[0])
      }
      console.log(file);
      setFile(file);
    }

    return (
      <section className='mx-auto max-w-3xl pb-12 text-center md:pb-20 w-min'>
        <input
            className="btn-sm relative bg-linear-to-b from-gray-800 to-gray-800/60 bg-[length:100%_100%] bg-[bottom] py-[5px] text-gray-300 before:pointer-events-none before:absolute before:inset-0 before:rounded-[inherit] before:border before:border-transparent before:[background:linear-gradient(to_right,var(--color-gray-800),var(--color-gray-700),var(--color-gray-800))_border-box] before:[mask-composite:exclude_!important] before:[mask:linear-gradient(white_0_0)_padding-box,_linear-gradient(white_0_0)] hover:bg-[length:100%_150%] cursor-pointer"
            type="file"
            accept=".pdf, .jpg, .jpeg, .png"
            onChange={handleFileUpload}
            />
      </section>
    )
  }

  export default FileUpload
