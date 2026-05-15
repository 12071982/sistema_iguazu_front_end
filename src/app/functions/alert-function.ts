import Swal from 'sweetalert2';



export function alert_success(title: string) {
    Swal.fire({
        icon: 'success',
        title: title,
        position: 'top-end',
        showConfirmButton: false,
        timer: 3000
    });
}

export function alert_warning(title: string) {
    Swal.fire({
        //position: 'top-end',
        icon: 'warning',
        title: 'Elemento eliminado de forma correcta',
        showConfirmButton: false,
        timer: 3000
    });
}


export function alert_error(title: string, message: string) {
    Swal.fire({
        icon: 'error',
        title: title,
        text: message,
        showConfirmButton: false,
        timer: 3000
    });
}



export function alert_delete() {
    Swal.fire({
        title: "¿Está seguro?",
        text: "¡No podrás revertir esto!",
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#3085d6',
        cancelButtonColor: '#d33',
        confirmButtonText: 'Si, Eliminar'
    }).then((result) => {
        if (result.isConfirmed) {
            return true;
            // Swal.fire(
            //   'Eliminado!',
            //   'Registro eliminado de forma satisfactoría.',
            //   'success'
            // )
        }
        else {
            return false;
        }
    })
}
