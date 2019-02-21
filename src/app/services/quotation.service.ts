import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Angular2PrestaService, Angular2PrestaQuery } from 'angular2-presta';
import { BehaviorSubject, Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { Cacheable } from 'ngx-cacheable';
import { QuotationItem, Email } from '../models/quotation.type';
import * as moment from 'moment';
import * as jsPDF from 'jspdf'; 
import 'jspdf-autotable';

@Injectable({
  providedIn: 'root'
})
export class QuotationService {
  private officenetLogo = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAPgAAAA4CAYAAADQOTW/AAAACXBIWXMAABcRAAAXEQHKJvM/AAABNmlDQ1BQaG90b3Nob3AgSUNDIHByb2ZpbGUAAHjarY6xSsNQFEDPi6LiUCsEcXB4kygotupgxqQtRRCs1SHJ1qShSmkSXl7VfoSjWwcXd7/AyVFwUPwC/0Bx6uAQIYODCJ7p3MPlcsGo2HWnYZRhEGvVbjrS9Xw5+8QMUwDQCbPUbrUOAOIkjvjB5ysC4HnTrjsN/sZ8mCoNTIDtbpSFICpA/0KnGsQYMIN+qkHcAaY6addAPAClXu4vQCnI/Q0oKdfzQXwAZs/1fDDmADPIfQUwdXSpAWpJOlJnvVMtq5ZlSbubBJE8HmU6GmRyPw4TlSaqo6MukP8HwGK+2G46cq1qWXvr/DOu58vc3o8QgFh6LFpBOFTn3yqMnd/n4sZ4GQ5vYXpStN0ruNmAheuirVahvAX34y/Axk/96FpPYgAAACBjSFJNAAB6JQAAgIMAAPn/AACA6AAAUggAARVYAAA6lwAAF2/XWh+QAAAX1klEQVR42uydeZzVVfnH33cYmGHYZRFEFsNQsVxKwSxFSdNwydTMypQsLXNLzd3Un6aVa2WK/nyJ5RJqmqiZS4Vh6U8MS5QEIQHZZN8ZGIa5z++P8/k2hy/3fpd77wzDzH1er/uaud97zvme5Xme82znORkzIyV0AIYCw4H9gN2A3kBnYBOwApgHvANMAd4F1tO6oQLIRPxuQDZlmzXA/sBIzfUemusXgC/vQHPTUfixk+apGKgXfi3T/8VCDdAL6A5UpqhnwAZgObC6gLX1YbjoqSGiTDvgNWBO2sbTDGoX4BTgZCFeTYI6W4D3gWeBR4D3Sog4PYFbgG4JJrgSuA14PaZcBrgMOCgBAnUAXgbuAa4CRgGbc5Sr0vjvTDiuvsBpwNeBTwDtc/SxUPgu8PkSEEcFsA64HliUp8wQ4FvAUfq/UwnW3IC1wHQPp5akbKMKOAw4CRgBDBAuZ1L2I2A274rpPg18VMCYvgOclaDcmEIIHDOL++xkZleb2QIrDtaY2VgzG5LgnUk+A8xsVYr3n5qgzYyZ/SFFmw+p3lMx5R5I8O6OZnaemc2NaWtCEXP2kJUOVprZXjne0c7MzjWzpdb08B8z+3KK8R9qZhPNrKEJ+jLPzC4ys+qUa3JfwvZPL2TN40SmUcBE4MdA/yK5b1fge8DfgG+XQFzLSkJIw3VLWQ5PrMoW2eZQ4BngLmBQE4rLW0rYVi61owL4CfArieVNDUOA8cD3E0hml2inPbwEuJcLBgB3AE8BuzZB+1ZIpaiBXgA8B+xb4o72A+4XEnSiDKMk6h/ZCsZyHnBpM7+zCrgVOCaizPVS0WqaoT+jgSdLsCGWzDiUi9vdCPy8CSckA5wDPKSdva3C0cDvmnjXbi4YClyznd5dIymzW47fTgeubub+jADGAtUtkcCv0EJlmuH9JwL3igu3NTgQeBBnXW4NMKaZxPJ8sB/wpdCz3bRZtdsO/TlOqmiLIvCTJc40J3zN4/xdcdbppFJARQubv6TQSxy+b4HST0uDjpJGtjeMDn3/LjBwO/bnQq31dgPfTTYY53bqkKL+EmAa8AHOfdFR4uYn9DcpMl6MczdMBWZ6fctHQA0yOryjHTDOyNUeWKX/O0QYMTI4V8R75HZ5hXW/uQXO+1XAp1OUXwxMBmYAf28hRJ3x1rcf6Q1Li4BZmudceNIT2DslPu4pcb1W9U9KWO9l4FFgZQzTNuHSSTg3Zhx8HOcmfLQlEPiVEmmSwHSckew5YGEOAuuFC9A4D+dzTKpDjaTRWnip9KdNOcp3wFnjj/UIMw42AAdLJciyrVWynRb4DJwvvF0CBC/En/wZkvk9AebLFvK45rmp4X2tw5aYOc2IMAMfeCfSGUzHAjepfj7rcDVwKM6zMDRhu4EEWIuL1fhYgjoP43zRm1P0f4Lw46sJyh7ZEgh8eEKO1ADcDdyAc/Lng+U4d8FzQuab8hhAwtxuNPCAvvcXR45C/o2kiyLqBnwy4vfVam9TE875+biovzh4Aef+mduM+LAUZ/Sra8J3TMB5aOJcdpu0s54NPJ+QgfgRhcMSqFDrcBb4zSnHkAVeTEjge0raq9seBB5MwLcSIF0DzgB3YQxx+1y+J/AbXARckjpnScyHeL+fkd43mE0wxqaEvYl25wTwlOZs7nbCh6aEx0jnj38VF/KcBHx86JOg/DLSR8IFkJQpdKV53HN5F7RvQqT7Bc6XSIrJXg7so53xkgRc7EBJE60VjiXeLfgWLiCoNcbvN0hKICUeLSvgXR1ayJjbsR2NwRXAZ3FROFEwVbpZWqjHxX+3A3rgjGJx/Ulqjc02wXwYpY32Cu8so2LKbQGuE2PcHmDN8I5MM9WxhDhUKB5lS9SPpFJjQdJlJXBIgnK/otEKXQi8IZEpiahycMIJ7I9zseUzsrUDZuNO4SSFapyFdBm5jWzBIYsXU+pUWZzhcZ+YcpPU9vaCzurj5hy7TobGw0N1tA7oIR1/bcpdth53ICktfBE4whPvt6Ro51RgL+IPiFXivC0PAtlK4kNRF5UA6QbijGhJuOpg6e5xBL4v8dbJx1ISeGec1TYKZuNcVWmQvEHjigtqmdAMdoC4Of1bhKi5DPic5qA1QE+cAbi54HCcS7gQOE6fJPAnnO0rW0m8a2wasKDIgQ3S4PZIOOk9SiSCN4XIWahxb9cYvbCe5MakphSfq2L02gxlKBSyzfgeC0TOngl2rGKhOoVu2xFniLJWtLBGvJtwTTPo3lamsbYFlcRbG9eV4D3LhMBJuH8F2yY5aA0EHqfjNZRYPO8rfTrYNepoISecytC8BL4xhshLEUsbhCNOwfmCu8Qgel0rm+eM5jkKakgWAJMUvgL8sozibRsqiHf0D6U4P96uOOvfL4RwH8SU34Cz2Fe0snleFrNDdyF5qHASGFZG7zJUAP9JgChDC2y/D87A9oJ270kJVILVRB80SQNNcUwwQ3pDUwUuKi1uFz+qRH3sirN2l6FlSG+5/m/qd2YCEX0K2x6z86EHLmzyhpQvqRIxv0njoYz9iY4vh8bTaXH+vhXA2xGTVoU7oZYG6tXfTXnarcR5FOoLYDTzcSfVomLhTwB+qrLFwNG4E31pYTXwzwgmtTYBk9rR4CHgLzRN5FuF5jSISvwd7gRdYHDegjszfliCtu7XBtk+Ia41BAj7N32J2u2+h8t9NSslsSyk0XJbA1yeYGeepL9xFt9/iDGV0jK8Fhc8M7/ECx2cvpocQ+C74PykFxXxrh6403CFwL81p63NBhKHbw8107umsK0r9OCEBP5X4LeFcJg3ccc/o6AfcDvpgubDRzKvJj5qbj3w0nZe8KZwJQXSwHMJyp5DslNK+eBG0p01b+vQbgd5f0H9DMSuJxOUPQ64j2gLeD7kvhJ3Ei0Jl5ragnSmUsNEqRVxqs29OCt4WpXoFuDcMs3+d7PYXgy9xUCFp4ckSShwGu5s7oiE7Q/GhczdRDI/8D1tAOnuT1CuOy4RwS0kO/a4H/B7is9omm1Fcz0vYbnq1oxwgSFrDi6Rw80J6hyCi3WdADwhnWKVCLQC58vdG5cA7+sS75PA0y1APG8OeBh3/v6ABDvypdrJn9CczxSTyNB4eOV4fUqRnXZ33JHgbIwkU6F+3EH645/NBW/jDIIdY8odI6Zb15oJHNyJsWNwx0fjoAvwTeAbOP/uAhpzsu0iok4TjbYYd0wy2wYIfB0uJ9uEhDaNwTij2SWa4/UisG64LCelVCn64dJsJYFVks5aKoFPx9mXRsaUC1JXP0H+/HC51LhabUh1OwqBr8Ol0nme5Nk+K4Cd9SkU6oW879F24E84d1ga12Nwpr5Hge9cImb8iRKNoZALFZsTNuPSf41MUDbNSa0APpJqtLQlI1pYL/4nLtXs2mbsw/UUYP5vBXBzQn28VMh+Hi0nI2tzweNipk0BO4RxLpfh61ngTJyDvikhC/wId5dVW4QGSUxNTeS1ONfbk7S9CyY24+IK5rVRHMtr2X4KF1X1fhO9dwUuweKPadtHGDfhMqde10S63HycT31cG57jabj024vKBL41TMKll/k1pblsPYCJuJjrtox0PmyRLn4C8Tnr0khHT+HuAv9DeYqZhDMgTy4T+NawABcrOxpnMdxc4HtM+v0Zmui3EtTJJPg9U+LxtqMwq3RFkWMBlxZrpETKmQXOcz0uWOjLuBxes1L2Mw1k2LGyu7ytjeUy4k80lmLNSw0FzXVlgjJZ4M9CnOE4v+wonM+0JgbZPsRlVX1SO/eGFH2bI6aQS3TtgHODpBXvV4qL50q71A7n+ink0oMZYlq5GGB1CoRaDdyJcz8dgbuc8QBc1tt8hyHW4bLuTNKu/UYEI16AOz1Yl4MB52PM+RjhSm+ukt4TV+h9cpUJy8Ux6DW4iw7G4VKIjcLFbHQnXShoJc6KXooMvObZZKLGVZDHImNWkArcGeef3RN3PUxvnN+7QUQyV/r7B0KEQjlkJmZisgVwwSQRdS2hrwH0xB253Q3np65Re2tEsLOlaydhnh3FKCwhIcf9XqtxDZA9pUNE2Yx+u1l6cRq4CBefsTmGCJbiQqI3pFy7jqSP9TZcTEKxNqSP4dzM2Zg+zqKAlF6FEngZylCGVqCDl6EMZSgTeBnKUIYygZehDGUoE3gZylCGMoGXoQxliIHKErTRCXfutrlPFvXHBXMMwrniHsO5HAbhfO9pMsMcjnP5Tcf5+8uQH4bgAnKexblthuPunfs9yRIyDgCOxAX2FBs++kngU7g4i6Susb64a5xfInnuvc/hkp1kcSfU3iqCVr5EY/zIq2wb1NQNd9a/0GCcQ4XLW4AGzKzQTwczG2Nmj5hZlyLaKeTT2cxes63h62Y2Sf9flbK9x1Xv0WYex474+YaZ1ZnZcH2/zcwWm1m/hPWPNbPNZvaFEvTlMjOrNbNdU9QZqbU+JmH5rmY2WXVuNbPqIvo70MyWeDh7pvdblZmdZGb/NLM7injHg177m4rZwc8ExuIyujT3jZh7Agfq/ytwxyBnA5/BBVvMSdneO7jAnXfLG3QsGFtHAj6Ey8y7KmX9bAn7krZO2h2xO+647d1F9rdeeBpIG6s9Vfke0RS4qM+SrFWhBN4RF6oKLoJtAC6qqhYXbVUp8a1WZWokdjTgsrfEMYReErfbq9153sJUSyRsr/Yn4+KMa3EZRavY9qhrexojhtZL/Fnj/T5WiLrBm/B++rtYTGMvtTMTdxouV/t9NLaPcGG6cUic0XsGq9+LhABRh3u6COHCoZJ9NEfLvP4HUYTDtAazNJ4kMFBj2iDVZX0eAvkAl88vHGW2q8T5WlxUY1SOgRqJzmuJjtbqpHWokphcn4dg+9B4XfUszUkhhF6tsZ0vBrYbW+fFr9I8N2gt62i8KaiKxnx6QRj0MhFxpcoHx1gH4e4MCKCr2l3H1skjO6kPO2leF+h9/lj8dagrVAy43syyEgO2mNkGMztHovO7ZrbSzE4MiWUrzGyame0S0W57M7vYzGZ7YsYKMxtrZr1U5nIzq9dvWYlof9G7n1dfzvfa3N3MnlE5M7MG9fFYr8xYM9toZnfr+05mNtXMPjSzs83s/7z+TDezw726/c3saa99M7M1Zna/+pRvrNVmdovE28Ua50Yze8LMekbU+46ZLTCzwd6zdhrj4/rew8ymmNlNZvai1qNO7/lmzNp2MrPb1Z+lZrbazN42s4P0+9fMbJOZHajvP9K69vHG9RPVX6b675rZIfr9GPXlCH3vZmYTzOx9Mzsgol/7m9mbZrZe/XrDzB7T2HwR/ftmttDMluvzoZmd7v1+qNZodMw8HGNmr+t9Aawysz96Y+9kZs/q+VIzm2Fme+i3m9S3pWY2y8z21hxNlZi+RCJ5HzObKToKYL3aPMvrz6lm9pZwJKC7+Wb2CzPr7ZW7zmtnWqEEfqE6b0Ls96SbddeATN+D8ifr2RIzGxDR7lUeEb4mgl2rZ8+YWcbMvm1mc71yM8zs1yKmN/T8Sg95AuKcJ/3kH/q+3Mz2Vbnf6tkj+t5LSBKMb6IIdoWevS4bBNLbzczmmNldZvakx4C+FTHWy1XmAjMbJIK9Ws9+EFHvArW/e4jAXzWzlzwGNVtIcKuZDTOzz5jZv8xsUQyTvVmM82Kt1aeElLNkazklROABk+rrIVjWzK5Q/f2lw84V4zlKBD5KeuczYgSjIvq0k5jEDDP7rHTZa/Se5WKygX0ga2Z3mtkQfe7SfH0xBYF/KbQh/EuMPYD5Ilg0ryu938aa2WHaaAL4ocoOCOngp2kt1lpuuFj1zvJwykTkDd73F8RsEM4F8HwxBo5r1cgUERJa5MWe0SsNge/m1b3dzCr0/EQhhGn3QNw/4HQBkXb0CPwKb8FNu8gIPeutHf9Nz9ASEPjDHoEv0LPfmVmlnl+hZwu9cZwqo0hgdKo0s7+r3E8i5u9cSUL+s15Cnvsi6p0vI9WQEIFP0m4dEMR8Pavwyp2hfh2Up+0+WoMHQ89HaZcdZGZfCRH4z8zsI81rd713fKj+Z7XT7S7jWq2ZHa95X2BmB8fg2qnq91Gh50+Y2ToRSYV2uD+HxlyltQ7m5pAYAq/xNgEzs196u/WfvOf3htbEl97med+f8jaDAR6OmySL9qo/13v+VxH3J81sZ0khAYw3s70kMW/MYbA72iP+e4sxsjV4ukx9CQwbB0hHXou7YCHQXyfgsmN+DpfAYLzeHbQZpecO19/pNN65tQyXXGEjyY77/dkrN93TqYK5ewx4WUa/63Cnnvb3dPN8cLf0tE9Lrxqi/vanNFluKuQq9Ocn0G/zHT39OO702quh5xM9w8/BEfgwEJdV95XQb6/hUjuDu8gyg8v5vgcum+/rMWMZrnULG0FfwWVFzWre9pDB9HJvjJul4/eXDhtnF9mTre/PywJjtCa13vODpaNvkg1nBC7LcFcaU1jPxJ3v3xyxRvXC969KFwd3Ldcd+v8EzSvSyW8SHk7HHSc+Qr8dgTsGu1i43QmYUwo/eKn87d28QawPTXBg1OrsGacyKdrcGGJC61L0PdyXMNMagzsq2V+GlKkipIExDOTTuBtM9lS9RbhjlGsoXSKF+hxGvSjoTONtN4VYtKtVf02CcuBy4Y/BJUeMSgjZVYQUJpSVHrPvrPH1FdH7xz+XkTxbThe2zl13YZ5yPVV2k9b5HRG4D/MS+vrD+Oz3fSfv/7UhA7J/9Xd3/V0go3Nf4N/FEHgmx+5sIQtkAElS/X7kWdD7exNTIyszBQRGLPGsqt08xDtdfXolwcJbHgLZIu/Bz9T+1eLEK3DXJUcReEdx/V64DDf/FrL2xGUdSZshplIcuzYlQYchuMCid+h5d+3AL0fsgBlZ3OvZNu12N1xa4kmq34C7zuoVSWe3K/hlbQRudBMR+1b23p5Feq3+PsG212QF+LchwdwG3p9gc7gKl5m1isZ8AlkxmzWe9HlZaBOo0K56gcZXKCwMMZXAY9VBXo4A5nuW9tv0/pUVEiM7h7hGNVsn1c/oe3WO3aGbXtpFExjseCO8Tp2SQFR/Sy6iKuBaEUhX4IfAvprQ51IibiAq7i33REeJVrcBPwe+UMTEZ4XIvTWuySLuYbh82WFOTIgr761orldVz4CD5F6KEiPXCKkHe8/2wOU7LzbDyAy5944PEcJo4EGJ1/URUtpsXMaY40JS25FyQw77b4RV4250mUTwqGuXJgoX/GuuO+g9pr4u1BqcyNZ5+rvj8tI9kGIO3vC+HySxdznuRpoLcanH+gknO4mAe6r8i554jRh/3FVfW9g6Eu8wzcs+kmymenR5K3Cy/o7waPH3+v8MSUbjgXuR22SR57bAzB6Q5XRnfd9ZlsRfe2VO81xV62V0w8zG6Xm96sz3DFZxVvRveoaDZaobuONu9sp93jOy7eMZ2SaHrOiVsowH/ZkrI4ipb8H4xoes6L01J4GlM3jv8d44Bsoq/J6efSiDyiLPAvtInnFWyeq9XIaWQ8zsUrmKGtROvjkaJhfKNNU9V4bO9Wb2B5XpqX7cGap7nPo1MqL9MzXnv5HB5hx5Rp7x3GR+JNutoUi2wJI9Xpbrs2WEe0G/j84RyTZOFv/P5+lTheayVt6Ho2UQ3SjPxq4eXqyTsfUUWcP/qP58NRTJdmzEHBzoeVECI+067/s8z6X3U+/5SjPbT3gxw3s+WRFx/UNWdN/LcluEFX1UqF4YfGPujd7zmZXST5eG9JvV0luy3m61PKRbPY+7sOAET88FuEbc9XgZjn6rz43a3aPSAz8sTvwDRRB1kXHsLv3m9+916T8bvD6+q116occZvydjx+k0xq0/rf4s8Ywh02hMUrhZho7+IT1nJS5yb6m45irgbInpB+JitO9SO5dod6nJITrX4XKV3ylRvVZc+ru4uPi98tQDdwPMGPV/nMZ6o4xbPT2OPoVtI/pWSiSO0pHHaV6v1E6xUTrytfp9hXa4wI4xV+8K1vVRzd81uBjxTfp7rbd2k0ORbzdIIjlBUlc2h7R0jlS0S7WTvaTd9AQPd/+iXf167dgZ7cgnylgbSECTiU4lFtw9/0PhYV9JHTMlTdyhNR6qdZ8saW0cjbfH/g8u1VS9pNIgcek/pJrB1rei/Fwi9yjRzxpPZZkoA/NF+ruz8H4q8L+4q5cC+FA0Uw/M+f8BAKBqEpAM6bgDAAAAAElFTkSuQmCC';
  private displayAndJSON = '&display=full&output_format=JSON';
  private ws_key = '?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU';
  private urlAPI = 'https://officenet.net.ve/api/cotizr_quotation' + this.ws_key;
	public numberRegex = /^\d+$/;
  private emailMatch = /^[a-zA-Z0-9\-_]+(\.[a-zA-Z0-9\-_]+)*@[a-z0-9]+(\-[a-z0-9]+)*(\.[a-z0-9]+(\-[a-z0-9]+)*)*\.[a-z]{2,4}$/;
  private httpOptions = { headers: new HttpHeaders({'Content-Type':  'application/xml'}) };

	quotationState = {
    isLoading: false,
    searchCompleted: false,
    searchType:'',
    sendQuotation:{
      isLoading:false,
      message:'',
      finish:false
    },
    userQuotations: new BehaviorSubject(null),
    searchedProducts: new BehaviorSubject(null),
    searchedQuotations: new BehaviorSubject(null),
    quotationEmails:[],
    quotationItems:[],
    quotationInfo:{
      isCompleted:false,
      userName:'',
      companyName: '',
      companyAddress: '',
      phoneNumber: '',
      RIF: '',
      cotizer: ''
    },
    error: {
      hasError:false,
      type: '',
      message:''
    },
    editItem: null
  }

  constructor(private aps: Angular2PrestaService, private http:HttpClient, private router:Router) { }

  searchProduct(query, value?): void {
    this.resetErrorStatus();
    this.resetSearchStatus();
    let numberValue = query.value.match(this.numberRegex) ? query.value : undefined;
    let isFromEnter = value && value.keyCode == '13' ? true : false;
    let productsQuery: Angular2PrestaQuery;

    (numberValue) ? 
      productsQuery = { resource: 'products', search: '', filter: { id: query.value, active: 1 } } :
      productsQuery = { resource: 'products', search: query.value };

    console.log(productsQuery);
    if (query.value.length > 0) {
      this.resetErrorStatus();
      this.throwLoadingState('search', 'product');
      console.log('Trying to connect to DB...please wait.');
      console.log(query.value);
      let searchSub = this.aps.search(productsQuery).subscribe((res: any) => {
        if (res != undefined) {
          if (res.length > 0) {
            res.map((x) => { x.price = parseFloat(parseFloat(x.price).toFixed(2)) });
            this.quotationState.searchedProducts.next(res);
            this.killLoadingState('search');
            this.setSearchCompleted('search', true);
          } else {
            this.quotationState.searchedProducts.next(res);
            this.killLoadingState('search');
            this.throwError(19, 'search');
          }

          searchSub.unsubscribe();
        } else if (res == undefined) {
          this.quotationState.searchedProducts.next(res);
          this.killLoadingState('search');
          this.throwError(19, 'search');
          this.setSearchCompleted('product', true);
        }
      }, 
      error => {
      	console.error(error);
      })
    } else {
      this.throwError(19, 'product');
    }
  }

  public resetStatus(): void {
    this.quotationState = {
      isLoading: false,
      searchCompleted: false,
      searchType:'',
      sendQuotation:{
        isLoading:false,
        message:'',
        finish:false
      },
      userQuotations: new BehaviorSubject(null),
      searchedProducts: new BehaviorSubject(null),
      searchedQuotations: new BehaviorSubject(null),
      quotationEmails:[],
      quotationItems:[],
      quotationInfo:{
        isCompleted:false,
        userName:'',
        companyName: '',
        companyAddress: '',
        phoneNumber: '',
        RIF: '',
        cotizer: ''
      },
      error: {
        hasError:false,
        type: '',
        message:''
      },
      editItem: null
    }
  }

  private resetSearchStatus(): void {
    this.quotationState.isLoading = false;
    this.quotationState.searchCompleted = false;
    this.quotationState.searchType = '';
    this.quotationState.searchedProducts =  new BehaviorSubject(null);
  }

  resetErrorStatus(): void {
    this.quotationState.error = {
      hasError:false,
      type:'',
      message:''
    }
  }


  private killLoadingState(loadingType: string): void {
    if (loadingType == 'search') {
      this.quotationState.isLoading = false;
    }
  }

  private isEmpty(elem): boolean {
    return elem != '' ? true : false;
  }

  public checkFields(): boolean {
    if (this.quotationState.quotationItems.length != 0) {
      if (this.isEmpty(this.quotationState.quotationInfo.userName)) {
        if (this.isEmpty(this.quotationState.quotationInfo.companyName)) {
          if (this.isEmpty(this.quotationState.quotationInfo.companyAddress)) {
              if (this.isEmpty(this.quotationState.quotationInfo.cotizer)) {
                if (this.isEmpty(this.quotationState.quotationInfo.phoneNumber)) {
                  this.resetErrorStatus();
                  return true;
                } else {
                  // console.error('Theres no phone number provided');
                  this.throwError(10, 'quotation');
                  return false;
                }
              } else {
                this.throwError(14, 'quotation');
                return false;
              }
          } else {
            // console.error('Theres no company address provided');
            this.throwError(9, 'quotation');
            return false;
          }
        } else {
          // console.error('Theres no company name provided');
          this.throwError(8, 'quotation');
          return false;
        }
      } else {
        // console.error('Theres no author name provided');
        this.throwError(7, 'quotation');
        return false;
      }
    } else {
      this.throwError(1, 'quotation');
      return false;
    }
  }

  public getUserQuotations(user, sessionType): Observable<any> {
    this.quotationState.sendQuotation.message = 'Actualizando lista de cotizaciones...';
    console.log('SERVICE: LOADING USER QUOTATIONS');
    return this.http.get(this.urlAPI + this.displayAndJSON + '&filter[id_customer]='+user.id, { responseType: 'text' })
    .pipe(map(res => {
        if (JSON.parse(res) != []) {
          let array = JSON.parse(res)['cotizr_quotations'] ? JSON.parse(res)['cotizr_quotations'] : JSON.parse(res);
          if (array.length > 0) {
            console.log('Quotations is bigger than 0');
            let quotations = JSON.parse(res)['cotizr_quotations']
            .map((x) => { x.products = JSON.parse(x.products); return x; }).sort((a,b) =>  b - a);

            quotations.forEach((x) => {
              x.products.items.map((y) => {
                y.total = y.ammount * y.price
              })
            })

            console.log('Quotation Service, we got saved.');
            console.log('Saving Quotations');
            return quotations;
          } else {
            console.log('User Quotation Status: EMPTY')
            let model = [''];
            this.quotationState.userQuotations.next(model);
          }
        } else {
          this.quotationState.userQuotations.next(JSON.parse(res));
        }
    }));
  }

  public editQuotation(quotation, state: number, message?:string): void {
    let editModel = {
      email: quotation.products.metadata ? quotation.products.metadata.userInfo.email :'null',
      status: {
        value: state,
        message: message ? message : 'El motivo no fue especificado'
      }
    }
    console.log(editModel);
    console.log(quotation);
    quotation.products.state = { stateStatus: state, message: message ? message : '' }
    let xmlDoc = this.createXML(quotation.id_customer, quotation.emails, quotation.products, quotation.metadata, quotation.id);

    let editSub = this.http.put(`https://officenet.net.ve/api/cotizr_quotation/${quotation.id}?ws_key=IDSVZ1NUDEEVVGH6G25CRWDFKDYAZNHU&schema=blank`, xmlDoc, { responseType: 'text' })
    .subscribe((x) => {
      if (x) {
        console.log('Done');
        this.sendStatusEmail(editModel, quotation);
        this.searchQuotation('all');
      }
    }, error => {
      if (error) {
        console.error(error);
        
      }
    });
  }

  private sendStatusEmail(edit, quotation): void {
    let body = {
      id:quotation.id,
      email: edit.email ? edit.email : 'null',
      status: edit.status.value,
      message: edit.status.message,
    }

    console.log(body);

    if (body.email != 'null') {
      let sendSub = this.http.post('https://cotizaya.officenet.net.ve/api/state-quotation', body, { responseType: 'text' })
      .subscribe((res:any) => {
        
      }, error => {
         console.error(error);
      });
    } else {
      this.throwError(16, 'edit');
    }
  }

  public searchQuotation(type:string, quotationId?:string): void {
    this.resetStatus();
    this.throwLoadingState('search', 'quotation');
    console.log('Quotation Search, type of searching\n' + type);
    let query = quotationId && quotationId.length > 0 ? `&filter[id]=${quotationId}` : '';
    let searchedQuotations = [];
    if (quotationId && quotationId.length > 0 || quotationId == undefined && type) {
      let searchSub = this.http.get(`${this.urlAPI}${query}&display=full&output_format=JSON&limit=50&sort=[id_DESC]`, { responseType: 'text' })
      .subscribe((res: any) => {
        let arr = JSON.parse(res)['cotizr_quotations'] ? JSON.parse(res)['cotizr_quotations'] : JSON.parse(res);
        if (arr) {
          if (arr.length > 0) {
            console.log('The array',arr);
            
            if (arr.length > 1) {
              arr.sort((a,b) => b.id - a.id);
            }

            arr.forEach((quotation) => { quotation.products = JSON.parse(quotation.products) });
            this.setSearchCompleted('quotation', true);
            this.quotationState.searchedQuotations.next(arr);
            this.killLoadingState('search');
            searchSub.unsubscribe();
          } else {
            this.throwError(18, 'quotation');
            this.killLoadingState('search');
          }
        }
      }, (error) => {
        console.error(error);
        searchSub.unsubscribe();
        return;
      })
    }
  }

  public getQuotationTotal(hasIVA: boolean): number {
    let result: number = 0;
    if (this.quotationState.quotationItems.length == 1) {
      result = hasIVA ? this.quotationState.quotationItems[0].price * this.quotationState.quotationItems[0].ammount / 100 * 16 + this.quotationState.quotationItems[0].price * this.quotationState.quotationItems[0].ammount : this.quotationState.quotationItems[0].price * this.quotationState.quotationItems[0].ammount;
    } else if (this.quotationState.quotationItems.length > 1) {
      result = hasIVA ? this.quotationState.quotationItems.map((x) => x.ammount * x.price / 100 * 16 + x.ammount * x.price).reduce((x,y) => x + y) : this.quotationState.quotationItems.map((x) => x.ammount * x.price).reduce((x,y) => x + y);
    }
    return parseFloat(result.toFixed(2));
  }

  private throwLoadingState(loadingType: string, attribute: string): void {
    if (loadingType == 'search' || loadingType == 'quotation') {
      this.quotationState.isLoading = true;
      this.quotationState.searchType = attribute; /* 'quotation' */
      console.log(this.quotationState);
    } else {
    	console.error('There is not accepted parameter for this loading state');
    }
  }

  public checkAmmount(item: QuotationItem): number {
    return this.checkExistence(item) ? this.getFromQuotation(item).ammount : 0;
  }

  private getFromQuotation(item: QuotationItem): QuotationItem {
    return this.quotationState.quotationItems.find(x => item.id == x.id);
  }

  private setSearchCompleted(type: string, value: boolean): void {
    this.quotationState.searchCompleted = value;
  }

  private addToQuotation(item: QuotationItem): void {
    let productModel: QuotationItem = {
      name: item.name,
      price: item.price,
      id: item.id,
      description: item.description,
      id_default_image: item.id_default_image,
      ammount: 1
    }

    this.quotationState.quotationItems.push(productModel);
  }

  public removeFromQuotation(item: QuotationItem): void {
    this.checkExistence(item) ? this.quotationState.quotationItems.splice(this.getOrderIndex(item), 1) : console.error('The items is not in the order cart');
    // this.updateQuotationItems();
    this.saveQuotationItems();
  }

  private getOrderIndex(item: QuotationItem): number {
    return this.quotationState.quotationItems.findIndex(x => x.id == item.id);
  }

  public changeAmmount(item, operation: string): void {
    operation == 'add' ? this.getFromQuotation(this.toQuotationItem(item)).ammount += 1 : this.getFromQuotation(this.toQuotationItem(item)).ammount > 1 ? this.getFromQuotation(this.toQuotationItem(item)).ammount -= 1 : this.removeFromQuotation(this.toQuotationItem(item));
  }

  public throwError(type: number, errorType?: string): void {
    let model = {
      hasError:true,
      type: errorType ? errorType : '',
      message: ''
    }
    this.resetErrorStatus();
    console.error('TRIGGER');
    if (type == 0) {
      model.message = 'Estas Ingresando un Email Inválido.';
    } else if (type == 1) {
      model.message = 'No has seleccionado ningún producto.!';
    } else if (type == 2) {
      model.message = 'Agregalos con la tecla "Enter".';
    } else if (type == 3) {
      model.message = 'Ingresa un email por favor.';
    } else if (type == 4) {
      model.message = 'Ya ingresaste ese email.';
    } else if (type == 5) {
      model.message = 'Ocurrio un problema con el servidor al enviar la cotización.';
    } else if (type == 6) {
      model.message = 'La cotización no ha sido guardada en la database.';
    } else if (type == 7) {
      model.message = 'El nombre del representante es requerido';
    } else if (type == 8) {
      model.message = 'El nombre de la empresa es requerido';
    } else if (type == 9) {
      model.message = 'La dirección de la empresa es requerido';
    } else if (type == 10) {
      model.message = 'El número de telefono es requerido.';
    } else if (type == 11) {
      model.message = 'El número de RIF es requerido.';
    } else if (type == 12) {
      model.message = 'El número de RIF es invalido.';
    } else if (type == 13) {
      model.message = 'El número de teléfono es invalido.';
    } else if (type == 14) {
      model.message = 'Indica quien genero la cotización';
    } else if (type == 15) {
      model.message = 'Por favor indica la razón de rechazo'; /*EDIT*/
    } else if (type == 16) {
      model.message = 'Esta cotización no fue registrada correctamente, se ha guardado en la database. El email no se ha enviado'; /*EDIT*/
    } else if (type == 17) {
    	model.message = 'Ingresa el ID de la cotización.';
    } else if (type == 18) {
    	model.message = 'La cotización que buscas no existe';
    } else if (type == 19) {
    	model.message = 'Lo sentimos, no tenemos el producto que buscas';
    } else {
      console.error(`Throw ERROR with code ${type}, does not exist in this function.`);
    }

    console.log(model);
    this.quotationState.error = model;
  }

  public checkExistence(item: QuotationItem): boolean {
    return this.quotationState.quotationItems.some(x => x.id == item.id);
  }

  public quotateItem(item): void {
    this.checkExistence(this.toQuotationItem(item)) ? this.changeAmmount(this.toQuotationItem(item), 'add') : this.addToQuotation(this.toQuotationItem(item));
    this.saveQuotationItems();
    console.log(this.quotationState.quotationItems);
  }

  private saveQuotationItems(): void {
    localStorage ? localStorage.setItem('cotizr-quotation', JSON.stringify({products:this.quotationState.quotationItems, metadata:''})) : console.error('Cannot get into localStorage');
  }

  private toQuotationItem(item): QuotationItem {
    let productModel: QuotationItem = {
      name: item.name,
      price: item.price,
      id: item.id,
      description: item.meta_description,
      ammount: 0,
      id_default_image: item.id_default_image
    }

    return productModel;
  }
  /*GENERATE QUOTATION*/
  public generateQuotation(user, sessionType): void {
    console.log('Generate Quotation');
    this.quotationState.sendQuotation.isLoading = true;
    this.quotationState.sendQuotation.message = 'Procesando Cotización...';
    let emails = this.quotationState.quotationEmails.length > 0 ? this.quotationState.quotationEmails : 'null';
    // this.router.navigate(['loading']);
    this.saveQuotation(user, emails, this.quotationState.quotationItems, sessionType);
    // this.sendQuotation(user, this.quotationEmails.length > 0 ? this.quotationEmails : ['null'], this.quotationItems, sessionType);
  }

  private saveQuotation(user, emails, products, sessionType): void {
    console.log('Input is', products);
    products.forEach((x) => {
      x.total = parseFloat((x.price * x.ammount).toFixed(2));
      return x;
    });

    let productModel = {
      items: products,
      info: {
        type: sessionType,
        metadata: this.quotationState.quotationInfo
      },
      state: {
        stateStatus:0,
        message:''
      },
      metadata: {
        generationData:this.quotationState.quotationInfo,
        userInfo: {
          type:sessionType,
          name:user.name,
          email:user.email,
          userId:user.id
        }
      }
    }
    
    this.quotationState.sendQuotation.message = 'Guardando Cotización en database...';
    console.log(productModel);
    let xmlDoc = this.createXML(user.id, emails, productModel, productModel.metadata);
    console.log(xmlDoc);
    this.http.post(this.urlAPI, xmlDoc, this.httpOptions)
    .subscribe((x) => {
      if (x) { console.log(JSON.stringify(x))}
    },
    (error) => {
      if (error.status == 201) {
        console.log('Quotation saved in DB...');
        console.log('THESSE ARE EMAILS:', emails);
        if (emails != 'null') {
          this.sendQuotation(user, emails, products, sessionType);
        }
        
        this.quotationState.userQuotations.next(null);
        this.getUserQuotations(user, sessionType).subscribe((x:any) => {
          if (x) {
            this.quotationState.userQuotations.next(x);
          }
        });
        this.generateLastQuotation();
      }
    });
  }


  private sendQuotation(user, emails, products, sessionType): void {
    let body = { 
      emails: emails, 
      quotations: products,
      IVA: parseFloat((this.getQuotationTotal(true) - this.getQuotationTotal(false)).toFixed(2)),
      subtotal: this.getQuotationTotal(false),
      total: this.getQuotationTotal(true),
      metadata: this.quotationState.quotationInfo,
      date: new Date().toISOString().slice(0, 19).replace('T', ' ')
    };

    this.quotationState.sendQuotation.message = 'Enviando Cotizaciones a Destinatarios...';

    let postSubscription = this.http.post('https://cotizaya.officenet.net.ve/api/send-quotation', body)
    .subscribe(
      (res: any) => {
      // console.log(res);
      console.log('Generated.');
      if (res.status = 200) {
        this.clearQuotation();
        this.router.navigate(['success']);
        this.saveQuotation(user.id, body.emails, body.quotations, sessionType);
        postSubscription.unsubscribe();
        this.quotationState.sendQuotation.isLoading = false;
      }
    },
      error => {
        if (error) {
          console.log(error);
          this.throwError(5, 'quotation');
          this.router.navigate(['error']);
          postSubscription.unsubscribe();
        }
      }
    );
  }

  clearQuotation(): void {
    this.quotationState.quotationItems = [];
    this.quotationState.quotationInfo = {
      isCompleted:false,
      userName:'',
      companyName: '',
      companyAddress: '',
      phoneNumber: '',
      RIF: '',
      cotizer: ''
    }
  }

  /*DATA*/
  public addToDestination(email): void {
    this.quotationState.quotationEmails.some(x => x == email) ? this.throwError(4, 'quotation') : this.quotationState.quotationEmails.push(email);
  }

  public removeEmail(item): void {
    (this.quotationState.quotationEmails.some(x => x == item)) ? this.quotationState.quotationEmails.splice(this.quotationState.quotationEmails.indexOf(item), 1) : console.error('The item doesnt exist in the grouped items');
  }

  public checkEmail(hasEvent, value: any): void {
    if (hasEvent) {
      let email = value.path[0].value;
      if (this.emailMatch.test(email)) {
        this.resetErrorStatus();
        if (value.keyCode == '13') {
          if (!this.quotationState.quotationEmails.some(x => x == email)) {
            this.addToDestination(email);
            value.path[0].value = '';
          } else {
            this.throwError(4, 'quotation');
          }
        }
      } else if (email.length <= 1) {
        this.throwError(3, 'quotation');
      } else {
        this.throwError(0, 'quotation');
      }
    } else {
      let email = value.value;
      console.log('Email Check by click button.');
      console.log('This is the email\n', value);
      if (this.emailMatch.test(email)) {
        this.resetErrorStatus();
        if (!this.quotationState.quotationEmails.some(x => x == email)) {
          this.addToDestination(email);
          value.value = '';
        } else {
          this.throwError(4, 'quotation');
        }
      }
    }
  }

  private generateLastQuotation(): void {
   console.log('Generating Last Quotation');
   let sub = this.quotationState.userQuotations.subscribe((x) => {
     if (x) {
      console.log('QUOTATION PDF INIT');
      console.log(x);
      let target = x.slice(x.length - 1);
      console.log(target);
      this.generatePDF(target[0]);
      this.resetStatus();
      this.resetProcess();
      this.router.navigate(['panel/user-quotations']);
      this.quotationState.sendQuotation.isLoading = false;
      sub.unsubscribe();
     } else { }
   });
  }

  public resetProcess(): void {
    this.quotationState.quotationItems = [];
    this.quotationState.quotationEmails = [];
    this.quotationState.quotationInfo = {
      isCompleted:false,
      userName:'',
      companyName: '',
      companyAddress: '',
      phoneNumber: '',
      RIF: '',
      cotizer: ''
    }
  }

  private createXML(id_customer: number, emails, products, metadata, id?): string {
    let date = new Date().toISOString().slice(0, 19).replace('T', ' ');

    if (typeof emails != 'string') {
      emails = emails.length > 1 ? emails.join(', ') : emails[0];
    }

    if (id) {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
        <cotizr_quotation>
          <id>${id}</id>
          <id_customer>${id_customer}</id_customer>
          <emails>${emails}</emails>
          <products>${JSON.stringify(products)}</products>
          <metadata>${JSON.stringify(metadata)}</metadata>
          <date_created>${date}</date_created>
        </cotizr_quotation>
      </prestashop>`;
    } else {
    return `<?xml version="1.0" encoding="UTF-8"?>
      <prestashop xmlns:xlink="http://www.w3.org/1999/xlink">
        <cotizr_quotation>
          <id_customer>${id_customer}</id_customer>
          <emails>${emails}</emails>
          <products>${JSON.stringify(products)}</products>
          <metadata>${JSON.stringify(metadata)}</metadata>
          <date_created>${date}</date_created>
        </cotizr_quotation>
      </prestashop>`;
    }
  }

  private numberWithCommas(num) {
    return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  }


  /*PDF*/
  public generatePDF(quotation): void { //isNew == true if is new, date will be added automatically, if is not, it will be added from the metadata.
    let quotationMetadata = quotation.products.info.metadata;
    console.log(quotationMetadata);
    let copyItems = Object.assign({}, quotation.products.items);
    let items = Object.keys(copyItems).map((key) => copyItems[key]);
    console.log('Generating PDF');
    console.log('The original is',quotation);
    let columns = [
      { title: 'Descripción', dataKey:'name' },
      { title: 'Cantidad', dataKey:'ammount' },
      { title: 'Precio', dataKey: 'price' },
      { title: 'Total', dataKey:'total' }
    ];

    let metadata = {
      IVA: this.numberWithCommas(parseFloat((this.getTotalArray(items, true) - this.getTotalArray(items, false)).toFixed(2))) + ' Bs.S',
      subtotal: this.numberWithCommas(parseFloat(this.getTotalArray(items, false).toFixed(2))) + ' Bs. S',
      total: this.numberWithCommas(parseFloat(this.getTotalArray(items, true).toFixed(2))) + ' Bs. S'
     }

    let quotationInfo = [
      { name: '', ammount: '', price: 'SUBTOTAL:', total: this.numberWithCommas(metadata.subtotal) },
      { name: '', ammount: '', price: 'IVA(16%):', total: this.numberWithCommas(metadata.IVA) },
      { name: '', ammount: '', price: 'TOTAL:', total: this.numberWithCommas(metadata.total) }
    ]

    items.map((x:any) => {
      x.total = this.numberWithCommas(parseFloat((x.ammount * x.price).toFixed(2)));
      return x;
    });

    let itemArray = this.getTotalPageRows(1);

    if (items.length / 22 > 1) {
      itemArray = this.getTotalPageRows(2);
      if (items.length / 22 > 2) {
        itemArray = this.getTotalPageRows(3);
      }
    }

    console.log(itemArray);


    quotationInfo.forEach(() => {
      itemArray.pop();
    });
    items.forEach(()=> {
     itemArray.shift();
    });
    items.forEach((x) => {
      itemArray.unshift(x);
    });



    // let arr = [];
    // let numberOfPages = items.length / 20;
    // if (numberOfPages) {

    //   for (let i = 1; i <= numberOfPages; i++) {
    //     arr.push.apply(arr, itemArray);
    //   }
    // } else if (items.length / 20){
    //   console.log('The number of pages:', items.length / 20);
    // }
    itemArray.push.apply(itemArray, quotationInfo);


    // console.log(arr);
//22

    let splitArr = quotationMetadata.companyAddress.split(" ");

    if (splitArr.length > 6) {
      let begin = splitArr.slice(0,7);
      let remaining = splitArr.slice(7);
      let addressTotal:any = [];
      addressTotal.push.apply(addressTotal, begin);
      addressTotal.push.apply(addressTotal, ['\n']);
      addressTotal.push.apply(addressTotal, remaining);
      // if (splitArr > 12) {

      // }
      quotationMetadata.companyAddress = addressTotal.join(' '); 
    } else {
      
    }

    let doc = new jsPDF('p', 'pt');
    doc.setDrawColor(0);
    doc.setTextColor(255, 255, 255);
    doc.setFillColor(27,158,226);
    doc.rect(40, 35, 515, 150, 'F');
    doc.addImage(this.officenetLogo, 'PNG', 40 + 215, 60, 100, 22.6);
    doc.setFontSize(12);
    doc.setFontType("bold");
    doc.text(40 + 15, 70, `Cotización Nro: ON-${quotation.id}`);
    doc.setFontSize(9);
    doc.setFontType("normal");
    doc.text(40 + 15, 82, 'Fecha: ' + quotation.date_created);
    doc.setFontSize(10);
    doc.setFontType("bold");
    doc.text(40 + 15, 95, 'Realizada Por: ');
    doc.setFontSize(9);
    doc.setFontType("normal");
    doc.text(40 + 15, 105, quotationMetadata.cotizer ? quotationMetadata.cotizer : '');
    doc.text(40 + 230, 100, 'RIF: J403450706');
    doc.text(40 + 360, 110, 'Teléfonos 0251-418-6000 \n                 0251-418-8717\nWhatsapp: +58 414 159 6439');
    doc.text(40 + 360, 150, 'Entregas total mente gratis en \n72 horas maximo \n(Lara, Yaracuy y Portuguesa)');
    doc.setFontType("bold");
    doc.text(40 + 15, 120, 'Representante:');
    doc.setFontType("normal");
    doc.text(40 + 90, 120, quotationMetadata.userName);
    doc.setFontType("bold");
    doc.text(40 + 15, 150, 'Empresa:');
    doc.setFontType("normal");
    doc.text(40 + 60, 150, quotationMetadata.companyName);
    doc.setFontType("bold");
    doc.text(40 + 15, 130, 'RIF:');
    doc.setFontType("normal");
    doc.text(40 + 40, 130, quotationMetadata.RIF);
    doc.setFontType("bold");
    doc.text(40 + 15, 160, 'Dirección:');
    doc.setFontType("normal");
    doc.text(40 + 65, 160, quotationMetadata.companyAddress);
    doc.setFontType("bold");
    doc.text(40 + 15, 140, 'Teléfono:');
    doc.setFontType("normal");
    doc.text(40 + 60, 140, quotationMetadata.phoneNumber);
    doc.autoTable(columns, itemArray, {
      addPageContent: (data) => {

      },
      headerStyles: {
        fillColor: [27,158, 226],
        halign:'center'
      },
      columnStyles: {
        name: {columnWidth: 220},
        ammount: {columnWidth: 80, halign: 'center'},
        price: {halign: 'right'},
        total: {halign: 'right'}
      },
      styles: {

      },
      startY: 183,
      showHeader: 'firstPage'
    });
    doc.setFontType("normal");
    doc.setTextColor(0);
    doc.setFillColor(27,158,226);
    doc.rect(40, 750, 515, 3, 'F');
    doc.text(40 + 15, 770, 'LA COTIZACIÓN PRESENTADA EN ESTA HOJA TIENE UNA VÁLIDEZ MÁXIMA DE 5 HORAS.');
    doc.text(40 + 15, 780, 'EL METODO DE PAGO ES 100% PRE-PAGADO');
    doc.setFontType("bold");
    doc.text(40 + 160, 800, 'Esta cotización fue generada por CotizaYA!:');
    doc.text(40 + 170, 815, 'https://cotizaya.officenet.net.ve');

    doc.save('Cotización - Productos de Officenet' + ' ' + quotation.date_created + '.pdf');
  }

  public getTotal(array, hasIVA: boolean): number {
    let result = 0;
    if (array.length == 1) {
      result = hasIVA ? array[0].price * array[0].ammount / 100 * 16 + (array[0].price * array[0].ammount) : array[0].price * array[0].ammount;
    } else if (array.length > 1) {
      result = hasIVA ? array.map((x) => x.ammount * x.price / 100 * 16 + x.ammount * x.price).reduce((x,y) => x + y) : array.map((x) => x.ammount * x.price).reduce((x,y) => x + y);
    }
    return parseFloat(result.toFixed(2));
  }

  private getTotalPageRows(number): Array<any> {
    let resultArr = [];
    let itemArray = []
    if (number > 1) {
      itemArray = [
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },/*26*/
      ];
    } else {
      itemArray = [
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' },
        { name: '', ammount: '', price: '', total: '' }/*20*/
      ];
    }

    for (let i = 0; i < number; i++) {
      resultArr.push.apply(resultArr, itemArray);
    }

    return resultArr;
  }

  public getTotalArray(array, hasIVA: boolean): number {
    let result: number = 0;
    if (array.length == 1) {
      result = hasIVA ? array[0].price * array[0].ammount / 100 * 16 + (array[0].price * array[0].ammount) : array[0].price * array[0].ammount;
    } else if (array.length > 1) {
      result = hasIVA ? array.map((x) => x.ammount * x.price / 100 * 16 + x.ammount * x.price).reduce((x,y) => x + y) : array.map((x) => x.ammount * x.price).reduce((x,y) => x + y);
    } else {
      result = 0;
    }

    return parseFloat(result.toFixed(2));
  }
}
