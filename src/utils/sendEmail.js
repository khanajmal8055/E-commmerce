import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
    service : 'gmail',
    auth:{
        user : process.env.EMAIL,
        pass : process.env.PASS
    }
})

export const sendEMail = async({to , subject , html})=> {
    await transporter.sendMail({
        from : `Ecom ${process.env.EMAIL}`,
        to,
        subject,
        html
    })
}