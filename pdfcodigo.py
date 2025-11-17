import tkinter as tk
from tkinter import filedialog, messagebox, scrolledtext
from fpdf import FPDF
import os

# =================================================================================
# HERRAMIENTA 1: GENERADOR DE PDF A PARTIR DE ESTRUCTURA DE CARPETA
# =================================================================================




def generar_estructura_directorio(ruta_carpeta):
    """Recorre una carpeta y genera una lista de strings con su estructura."""
    lista_estructura = []
    lista_estructura.append(f"Estructura de: {os.path.abspath(ruta_carpeta)}\n")

    for raiz, directorios, archivos in os.walk(ruta_carpeta):
        # --- CORRECCIÓN: Ignorar directorios ocultos ---
        # Modificamos la lista 'directorios' en el lugar para que os.walk no entre en ellos.
        directorios[:] = [d for d in directorios if not d.startswith('.')]

        # --- CORRECCIÓN: Ignorar archivos ocultos ---
        archivos_visibles = [a for a in archivos if not a.startswith('.')]

        nivel = raiz.replace(ruta_carpeta, '').count(os.sep)
        indentacion = ' ' * 4 * nivel
        nombre_directorio = os.path.basename(raiz)
        
        # Solo mostramos el directorio si no es la raíz de una carpeta oculta procesada
        if not nombre_directorio.startswith('.'):
            lista_estructura.append(f'{indentacion}└── {nombre_directorio}/')
            
            sub_indentacion = ' ' * 4 * (nivel + 1)
            for nombre_archivo in archivos_visibles:
                lista_estructura.append(f'{sub_indentacion}├── {nombre_archivo}')
    
    return "\n".join(lista_estructura)


def crear_pdf_con_texto(texto, nombre_archivo_salida):
    """Crea un archivo PDF a partir de un string de texto."""
    pdf = FPDF()
    pdf.add_page()
    pdf.set_font('Courier', size=10)
    pdf.multi_cell(0, 5, txt=texto.encode('latin-1', 'replace').decode('latin-1'))
    pdf.output(nombre_archivo_salida)

def iniciar_generador_estructura():
    """Función que lanza la herramienta 1."""
    ruta_seleccionada = filedialog.askdirectory(title="Seleccionar carpeta para documentar su estructura")
    if not ruta_seleccionada:
        messagebox.showwarning("Cancelado", "No se seleccionó ninguna carpeta.")
        return

    try:
        estructura_texto = generar_estructura_directorio(ruta_seleccionada)
        nombre_base_carpeta = os.path.basename(ruta_seleccionada)
        ruta_pdf = filedialog.asksaveasfilename(
            title="Guardar PDF de estructura como...",
            initialfile=f"estructura_{nombre_base_carpeta}.pdf",
            defaultextension=".pdf",
            filetypes=(("Archivos PDF", "*.pdf"),)
        )
        
        if ruta_pdf:
            crear_pdf_con_texto(estructura_texto, ruta_pdf)
            messagebox.showinfo("Éxito", f"PDF con la estructura de carpetas guardado en:\n{ruta_pdf}")

    except Exception as e:
        messagebox.showerror("Error", f"Ocurrió un error al generar el PDF de estructura:\n{e}")

# =================================================================================
# HERRAMIENTA 2: CONVERSOR DE CÓDIGO A PDF (DOCUMENTACIÓN)
# =================================================================================

class CodeToPDFConverter:
    def __init__(self, root):
        self.root = root
        self.root.title("Conversor de Código a PDF v2")
        self.root.geometry("550x450")

        self.file_paths = []
        self.table_descriptions_text = """

CONETNIDO DE MI BASE DATOS MySQL PYTHONANYWEHRE (EL CUAL SE USA CON LA API) :   

mysql> SELECT * FROM Usuarios;
+------------+------------------+--------------------------------------+-------------+---------+
| idUsuarios | rol              | email                                | contrasenia | id_aula |
+------------+------------------+--------------------------------------+-------------+---------+
|          1 | admin            | admin@admin.com                      | 123456      |    NULL |
|          3 | profesor         | cris@xdd.com                         |             |    NULL |
|          4 | profesor-tecnica | tito@amin.com                        | 123         |    NULL |
|          5 | soporte          | cristian@cristian.com                | 1234567     |    NULL |
|         14 | alumno           | ezequiel.quiroga@sagradoalcal.edu.ar | 123456      |    1008 |
|         15 | soporte          | leonardo.quiroga@sagradoalcal.edu.ar | 123456      |    1009 |
|         17 | profesor         | tito.gonzales@gmail.com              | 999         |    1009 |
+------------+------------------+--------------------------------------+-------------+---------+
7 rows in set (0.00 sec)
mysql> SELECT * FROM Aulas;
+---------+---------------+---------+-----------+----------+-------+
| id_aula | nombre        | bdr_max | proyector | splitter | audio |
+---------+---------------+---------+-----------+----------+-------+
|    1001 | 1A            |       1 |         1 |        1 |     1 |
|    1002 | 3B            |       1 |         1 |        1 |     1 |
|    1003 | 2A            |       1 |         1 |        0 |     1 |
|    1004 | 2B            |       1 |         1 |        1 |     1 |
|    1005 | 1B            |       1 |         1 |        1 |     1 |
|    1006 | Laboratorio 1 |       1 |         1 |        1 |     1 |
|    1007 | Laboratorio 2 |      11 |         1 |        1 |     1 |
|    1008 | 5B            |       7 |         1 |        1 |     1 |
|    1009 | 7B            |      12 |         1 |        0 |     1 |
|    1010 | 6B            |      10 |         1 |        1 |     1 |
|    1011 | 6A            |      10 |         1 |        1 |     1 |
|    1012 | Laboratorio 3 |      10 |         1 |        1 |     1 |
|    1013 | 4B            |      10 |         1 |        1 |     1 |
|    1014 | 5A            |      10 |         1 |        0 |     1 |
|    1015 | 4A            |      10 |         1 |        1 |     1 |
|    1016 | 3A            |      10 |         1 |        1 |     1 |
|    1017 | Secretaria    |       1 |         1 |        1 |     0 |
|    1018 | Preceptoria 1 |       1 |         0 |        0 |     1 |
|    1019 | Preceptoria 2 |       1 |         0 |        0 |     0 |
|    1020 | Preceptoria 3 |       1 |         1 |        0 |     1 |
|    1021 | Preceptoria 4 |       1 |         0 |        0 |     1 |
+---------+---------------+---------+-----------+----------+-------+
21 rows in set (0.02 sec)

mysql> SELECT * FROM Monitores;
+------------+---------+---------+--------------+
| id_monitor | marca   | modelo  | salida_video |
+------------+---------+---------+--------------+
|         11 | Samsung | S19D300 | VGA          |
|         13 | HP      | HP22y   | VGA          |
|         14 | HP      | HP22y   | VGA          |
|         15 | LG      | E1941   | NULL         |
|         16 | Samsung | S19D300 | NULL         |
|         17 | HP      | HP22y   | NULL         |
|         18 | HP      | HP22y   | NULL         |
|         19 | Samsung | S19D300 | NULL         |
|         20 | Samsung | S19D300 | NULL         |
|         21 | LG      | E2242   | NULL         |
|         22 | Philips | 193V    | NULL         |
|         23 | Philips | 193V    | NULL         |
|         24 | Philips | 193V    | NULL         |
|         25 | Philips | 193V    | VGA          |
|         26 | Philips | 193V    | NULL         |
|         27 | LG      | E2242   | NULL         |
|         28 | LG      | E2242   | NULL         |
|         29 | LG      | E2242   | NULL         |
|         30 | Philips | 193V    | NULL         |
|         31 | LG      | 20M38A  | NULL         |
|         32 | PHILIPS | 193V    | NULL         |
+------------+---------+---------+--------------+
21 rows in set (0.03 sec)

mysql> Select * FROM Gabinetes;
+-------------+--------+-----------+-----------------+-----------------------+--------------------+--------------+
| id_gabinete | ram    | disco     | so              | procesador            | motherboard        | fuenteAlimen |
+-------------+--------+-----------+-----------------+-----------------------+--------------------+--------------+
|          12 | 12 GB  | 500 GB    | Windows 11      | A51223                | 1233               | 500W         |
|          13 | 8GB    | 500GB HDD | Windows 11 Pro  | Intel Core i5-10400   | ASUS H310          | 500W         |
|          14 | 6GB    | 450GB HDD | Windows 9 Pro   | Intel Core i5-10400   | ASUS H310          | 220W         |
|          15 | 6,7 GB | 983.4 GB  | Ubuntu 28.04.6  | AMD A6-7600           | ASUS H310          | 500W         |
|          16 | 8,0 GB | 464,0 GB  | Windows 11 Pro  | Intel Core i5-10400   | ASUS H310          | 500W         |
|          17 | 3,6 GB | 500,1 GB  | Ubuntu 20.04.6  | AMD FX (TM)-4300      | ASUS H310          | 500W         |
|          18 | 8,0 GB | 1.0 TB    | Ubuntu 22.04.5  | AMD A8-7600           | ASUS H310          | 500W         |
|          19 | 6,8 GB | 976,0 GB  | Ubuntu 18.04.6  | AMD A8-7600           | ASUS H310          | 500W         |
|          20 | 8,0 GB | 900,1 GB  | Ubuntu 24.04.2  | Intel Core i5         | ASUS H310          | 500W         |
|          21 | 3,3 GB | 500,1 GB  | Ubuntu 20.04.6  | AMD Radeon r7         | ASUS H310          | 500W         |
|          22 | 7,6 GB | 250,1 GB  | Ubuntu 20.04.10 | AMD Radeon r7         | ASUS H310          | 500W         |
|          23 | 8 GB   | 240 GB    | Ubuntu 24.04    | Intel Core I5-10400   | MSI MS-7721        | 300W         |
|          24 | 8 GB   | 340 GB    | Windows 10      | AMD A8-7600           | MSI MS-7721        | 500W         |
|          26 | 8GB    | 100 GB    | Windows 10      | Intel Core I5-10400   | MSI MS-7721        | SATA/MOLEX   |
|          27 | 8 GB   | 224 GB    | Windows 10      | Intel Core I3-9300    | MSI MS-7721        | SATA/MOLEX   |
|          28 | 8 GB   | 1 TB      | Ubuntu 22.04    | AMD A8-7600           | MSI MS-7721        | SATA/MOLEX   |
|          29 | 8 GB   | 488 GB    | Windows 10      | AMD A8-7600           | MSI MS-7721        | SATA/MOLEX   |
|          30 | 8 GB   | 500 GB    | ubuntu 20.04    | Intel Core i5-10400   | MSI MS-7721        | ATX/MOLEX    |
|          31 | 8 GB   | 224 GB    | Windows 11      | Intel Core i5-10400   | MIcro Star MS-7D82 | ATX/MOLEX    |
|          32 | 6 GB   | 124 GB    | Windows 10      | AMD A6-7480 Radeon R5 | MSI MS-7721        | ATS/MOLEX    |
|          33 | 8 GB   | 244 GB    | Windows 11      | Inter Core I5-10400   | Micro Star MS-7D82 | SATA/MOLEX   |
|          34 | 32     | 900       | linux           | 12                    | mci                | 500          |
|          35 | 8 GB   | 500 GB    | linux 20.05     | Intel core I500       | MS-7D56            | 500W         |
|          36 | 12     | 12        | 2               | 12                    | mci1               | 121          |
+-------------+--------+-----------+-----------------+-----------------------+--------------------+--------------+
24 rows in set (0.05 sec)

mysql> SELECT * FROM Computadoras;
+--------+---------+---------------+--------------+----------------+-------------+------------+
| id_bdr | id_aula | estado_actual | estado_mouse | estado_teclado | id_gabinete | id_monitor |
+--------+---------+---------------+--------------+----------------+-------------+------------+
|  20100 |    1001 | En revision   |            3 |              3 |          36 |         32 |
|  20200 |    1002 | No disponible |            3 |              3 |          15 |       NULL |
|  20300 |    1003 | No disponible |            1 |              1 |          35 |       NULL |
|  20400 |    1004 | No disponible |            3 |              3 |          13 |       NULL |
|  20500 |    1005 | En revision   |            2 |              3 |          24 |       NULL |
|  20600 |    1006 | No disponible |            3 |              3 |        NULL |       NULL |
|  20700 |    1007 | No disponible |            3 |              3 |          19 |       NULL |
|  20701 |    1007 | Funcionando   |            3 |              3 |          20 |         22 |
|  20702 |    1007 | No disponible |            3 |              3 |        NULL |       NULL |
|  20703 |    1007 | Funcionando   |            3 |              3 |          27 |         23 |
|  20704 |    1007 | Funcionando   |            3 |              3 |          29 |         30 |
|  20705 |    1007 | Funcionando   |            3 |              3 |          26 |         25 |
|  20706 |    1007 | No disponible |            3 |              3 |        NULL |         27 |
|  20707 |    1007 | Funcionando   |            3 |              3 |          32 |         31 |
|  20708 |    1007 | No disponible |            3 |              3 |          33 |         28 |
|  20709 |    1007 | Funcionando   |            3 |              3 |          23 |         29 |
|  20710 |    1007 | Funcionando   |            3 |              3 |          22 |         21 |
|  20800 |    1008 | No disponible |            3 |              3 |          16 |         11 |
|  20801 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20802 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20803 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20804 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20805 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20806 |    1008 | No disponible |            3 |              3 |        NULL |       NULL |
|  20900 |    1009 | En revision   |            3 |              3 |          30 |         17 |
|  20901 |    1009 | No disponible |            3 |              3 |          18 |       NULL |
|  20902 |    1009 | No disponible |            3 |              3 |        NULL |       NULL |
|  20903 |    1009 | No disponible |            3 |              3 |          34 |         16 |
|  20904 |    1009 | Funcionando   |            3 |              3 |        NULL |       NULL |
|  20905 |    1009 | En revision   |            3 |              3 |          31 |       NULL |
|  20906 |    1009 | No disponible |            3 |              3 |          17 |         19 |
|  20907 |    1009 | Funcionando   |            3 |              3 |        NULL |       NULL |
|  20908 |    1009 | Funcionando   |            3 |              3 |        NULL |       NULL |
|  20909 |    1009 | Funcionando   |            3 |              3 |        NULL |       NULL |
|  20910 |    1009 | En revision   |            3 |              3 |        NULL |       NULL |
|  20911 |    1009 | En revision   |            3 |              3 |          21 |       NULL |
|  21000 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21001 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21002 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21003 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21004 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21005 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21006 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21007 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21008 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21009 |    1010 | No disponible |            3 |              3 |        NULL |       NULL |
|  21100 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21101 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21102 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21103 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21104 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21105 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21106 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21107 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21108 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21109 |    1011 | No disponible |            3 |              3 |        NULL |       NULL |
|  21200 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21201 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21202 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21203 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21204 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21205 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21206 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21207 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21208 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21209 |    1012 | No disponible |            3 |              3 |        NULL |       NULL |
|  21300 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21301 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21302 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21303 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21304 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21305 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21306 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21307 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21308 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21309 |    1013 | No disponible |            3 |              3 |        NULL |       NULL |
|  21400 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21401 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21402 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21403 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21404 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21405 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21406 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21407 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21408 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21409 |    1014 | No disponible |            3 |              3 |        NULL |       NULL |
|  21500 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21501 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21502 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21503 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21504 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21505 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21506 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21507 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21508 |    1015 | No disponible |            3 |              3 |          28 |       NULL |
|  21509 |    1015 | No disponible |            3 |              3 |        NULL |       NULL |
|  21600 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21601 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21602 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21603 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21604 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21605 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21606 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21607 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21608 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21609 |    1016 | No disponible |            3 |              3 |        NULL |       NULL |
|  21700 |    1017 | No disponible |            3 |              3 |          12 |       NULL |
|  21800 |    1018 | No disponible |            3 |              3 |        NULL |       NULL |
|  21900 |    1019 | No disponible |            3 |              3 |          14 |       NULL |
|  22000 |    1020 | No disponible |            3 |              3 |        NULL |       NULL |
|  22100 |    1021 | No disponible |            3 |              3 |        NULL |       NULL |
+--------+---------+---------------+--------------+----------------+-------------+------------+
111 rows in set (0.04 sec)

mysql> SELECT * FROM Reportes;
+-------------+---------------------+-----------------------------------------------------------------------------------------------------------+---------------+------------+--------+---------+-------------+
| id_reportes | fec_aviso           | info_problema                                                                                             | estado_nuevo  | id_usuario | id_bdr | id_aula | id_gabinete |
+-------------+---------------------+-----------------------------------------------------------------------------------------------------------+---------------+------------+--------+---------+-------------+
|           1 | 2025-09-30 00:00:00 | Movimiento de Gabinete: Se movió de la BDR 20700 (Aula 1007) a la BDR 20701 (Aula 1007).                  | Log           |          1 |   NULL |    NULL |          16 |
|           2 | 2025-09-30 00:00:00 | Asignación automática: la computadora fue puesta en el aula 1007 por el usuario 1                         | Asignado      |          1 |  20700 |    1007 |          18 |
|           3 | 2025-09-30 00:00:00 | Movimiento de Gabinete: Se movió de la BDR 00 (Aula 'Laboratorio 2') a la BDR 02 (Aula 'Laboratorio 2').  | Log           |          1 |   NULL |    NULL |          18 |
|           4 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 02 (Aula 'Laboratorio 2') y se envió a depósito.                 | Log           |          1 |   NULL |    NULL |          18 |
|           5 | 2025-09-30 00:00:00 | Asignación automática: la computadora fue puesta en el aula 1007 por el usuario 1                         | Asignado      |          1 |  20703 |    1007 |          18 |
|           6 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula Laboratorio 2, boca de red 02                   | Asignado      |          1 |  20702 |    1007 |          19 |
|           7 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula 6B, boca de red 00                              | Asignado      |          1 |  21000 |    1010 |          21 |
|           8 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          5 |  20701 |    1007 |        NULL |
|           9 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          5 |  20701 |    1007 |        NULL |
|          10 | 2025-09-30 00:00:00 | El monitor no anda                                                                                        | No disponible |          5 |  20701 |    1007 |          16 |
|          11 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          5 |  20701 |    1007 |        NULL |
|          12 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          5 |  20701 |    1007 |        NULL |
|          13 | 2025-09-30 00:00:00 | xdd                                                                                                       | No disponible |          5 |  20701 |    1007 |          16 |
|          15 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 01, aula 7B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          12 |
|          16 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 03, aula 7B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          14 |
|          17 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 05, aula 7B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          20 |
|          18 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 08, aula 7B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          17 |
|          19 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 10, aula 7B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          13 |
|          20 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 01, aula Laboratorio 2. Prontamente en revision                  | Log           |          5 |   NULL |    NULL |          16 |
|          21 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 02, aula Laboratorio 2. Prontamente en revision                  | Log           |          5 |   NULL |    NULL |          19 |
|          22 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 03, aula Laboratorio 2. Prontamente en revision                  | Log           |          5 |   NULL |    NULL |          18 |
|          23 | 2025-09-30 00:00:00 | Gabinete desasignado: Se quitó de la BDR 00, aula 6B. Prontamente en revision                             | Log           |          5 |   NULL |    NULL |          21 |
|          24 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula 1B, boca de red 00                              | Log           |          1 |  20500 |    1005 |          12 |
|          25 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula 2B, boca de red 00                              | Log           |          1 |  20400 |    1004 |          13 |
|          26 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          27 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20100 |    1001 |        NULL |
|          28 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula 1A, boca de red 00                              | Log           |          1 |  20100 |    1001 |          14 |
|          29 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revisión'.                                                     | En revisión   |          1 |  20100 |    1001 |        NULL |
|          30 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'No disponible'.                                                   | No disponible |          1 |  20100 |    1001 |        NULL |
|          31 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          32 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'No disponible'.                                                   | No disponible |          1 |  20100 |    1001 |        NULL |
|          33 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20100 |    1001 |        NULL |
|          34 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          35 | 2025-09-30 00:00:00 | fhjhdsfjhdsfgjhd                                                                                          | No disponible |          1 |  20100 |    1001 |          14 |
|          36 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          37 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          38 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20100 |    1001 |        NULL |
|          39 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'No disponible'.                                                   | No disponible |          1 |  20100 |    1001 |        NULL |
|          40 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  21500 |    1015 |        NULL |
|          41 | 2025-09-30 00:00:00 | ukhukjbhjjjgjg                                                                                            | No disponible |          1 |  20100 |    1001 |          14 |
|          42 | 2025-09-30 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20100 |    1001 |        NULL |
|          43 | 2025-09-30 00:00:00 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20100 |    1001 |        NULL |
|          44 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula Laboratorio 2, boca de red 00                   | Log           |          1 |  20700 |    1007 |          19 |
|          45 | 2025-09-30 00:00:00 | Colocacion de gabinete: El gabinete fue puesto en el aula Laboratorio 2, boca de red 00                   | Log           |          1 |  20700 |    1007 |          19 |
|          46 | 2025-09-30 00:00:00 | Movimiento de Gabinete: Se movió de la BDR 00 - Aula Laboratorio 2 a la BDR 08 - Aula Laboratorio 2.      | Log           |          1 |   NULL |    NULL |          19 |
|          47 | 2025-10-01 00:00:00 | Cambio de estado: La BDR se marcó como 'En revision'.                                                     | En revision   |          1 |  20900 |    1009 |        NULL |
|          48 | 2025-10-01 00:00:00 | Cambio de estado: La BDR se marcó como 'No disponible'.                                                   | No disponible |          1 |  20900 |    1009 |        NULL |
|          54 | 2025-10-01 09:06:53 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20900 |    1009 |        NULL |
|          55 | 2025-10-01 09:06:56 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20901 |    1009 |        NULL |
|          56 | 2025-10-01 09:06:59 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20902 |    1009 |        NULL |
|          57 | 2025-10-01 09:07:02 | Resolución: La BDR se marcó como 'Funcionando'.                                                           | Funcionando   |          1 |  20903 |    1009 |        NULL |
--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

"""
        self.python_code_text = """

CODIGO API PYTHONANYWHERE (ESTE SE USA COMO API PARA EL PROYECTO)

from flask import Flask, request, jsonify
from flask_mysqldb import MySQL
from flask_cors import CORS
from datetime import datetime
from zoneinfo import ZoneInfo

app = Flask(__name__)
CORS(app, supports_credentials=True)

# Configuración de la base de datos
app.config["MYSQL_HOST"] = "soporte2025.mysql.pythonanywhere-services.com"
app.config["MYSQL_USER"] = "soporte2025"
app.config["MYSQL_PASSWORD"] = "tecnica25"
app.config["MYSQL_DB"] = "soporte2025$default"
mysql = MySQL(app)

# ===============================================
# FUNCIÓN AUXILIAR PARA CREAR LOGS
# ===============================================
def crear_reporte_log(info_problema, id_usuario, id_bdr=None, id_aula=None, id_gabinete=None):

    try:
        cursor = mysql.connection.cursor()
        ahora_en_argentina = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires"))
        sql_reporte = "
            INSERT INTO Reportes (fec_aviso, info_problema, estado_nuevo, id_usuario, id_bdr, id_aula, id_gabinete)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        "
        cursor.execute(sql_reporte, (ahora_en_argentina, info_problema, 'Log', id_usuario, id_bdr, id_aula, id_gabinete))
    except Exception as e:
        print(f"ALERTA: No se pudo crear el reporte de log. Error: {str(e)}")


# ===============================================
# FUNCIÓN AUXILIAR PARA VERIFICAR PERMISOS DE ROL
# ===============================================
def tiene_permiso(id_usuario, roles_permitidos):

    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT rol FROM Usuarios WHERE idUsuarios = %s", (id_usuario,))
        resultado = cursor.fetchone()
        return bool(resultado and resultado[0] in roles_permitidos)
    except Exception:
        return False

# ===============================================
# AUTENTICACIÓN
# ===============================================
@app.route('/login_usuario', methods=['POST'])
def login():
    try:
        datos = request.get_json()
        email = datos['email']
        contrasenia = datos['contrasenia']
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT idUsuarios, rol, email, id_aula FROM Usuarios WHERE email = %s AND contrasenia = %s", (email, contrasenia))
        usuario = cursor.fetchone()
        if usuario:
            usuario_info = {
                "idUsuarios": usuario[0],
                "rol": usuario[1],
                "email": usuario[2],
                "id_aula": usuario[3]
            }
            return jsonify(usuario_info), 200
        else:
            return jsonify({"error": "Credenciales inválidas"}), 401
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ===============================================
# CRUD USUARIOS
# ===============================================
@app.route('/registrar_usuario', methods=['POST'])
def registrar_usuario():
    try:
        datos = request.get_json()
        email = datos.get("email")
        rol = datos.get("rol")
        contrasenia = datos.get("contrasenia")
        id_aula = datos.get("id_aula")

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Usuarios WHERE email = %s", (email,))
        if cursor.fetchone():
            return jsonify({"success": False, "mensaje": "El email ya existe"}), 400

        if id_aula:
            sql = "INSERT INTO Usuarios (email, rol, contrasenia, id_aula) VALUES (%s, %s, %s, %s)"
            cursor.execute(sql, (email, rol, contrasenia, id_aula))
        else:
            sql = "INSERT INTO Usuarios (email, rol, contrasenia) VALUES (%s, %s, %s)"
            cursor.execute(sql, (email, rol, contrasenia))

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Usuario registrado exitosamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_usuarios', methods=['GET'])
def obtener_usuarios():
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT idUsuarios, email, rol FROM Usuarios")
        usuarios = [{"idUsuarios": u[0], "email": u[1], "rol": u[2]} for u in cursor.fetchall()]
        return jsonify(usuarios)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_usuario/<int:id_usuario>', methods=['GET'])
def obtener_usuario(id_usuario):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT idUsuarios, email, rol FROM Usuarios WHERE idUsuarios = %s", (id_usuario,))
        usuario = cursor.fetchone()
        if usuario:
            return jsonify({"idUsuarios": usuario[0], "email": usuario[1], "rol": usuario[2]})
        return jsonify({"error": "Usuario no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/actualizar_usuario/<int:id_usuario>', methods=['PUT'])
def actualizar_usuario(id_usuario):
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT email, rol, contrasenia FROM Usuarios WHERE idUsuarios = %s", (id_usuario,))
        usuario_actual = cursor.fetchone()
        if not usuario_actual:
            return jsonify({"error": "Usuario no encontrado"}), 404

        email_actual, rol_actual, contrasenia_actual = usuario_actual

        nuevo_email = datos.get("email", email_actual)
        nuevo_rol = datos.get("rol", rol_actual)
        nueva_contrasenia = datos.get("contrasenia", contrasenia_actual)

        sql = "UPDATE Usuarios SET email = %s, rol = %s, contrasenia = %s WHERE idUsuarios = %s"
        cursor.execute(sql, (nuevo_email, nuevo_rol, nueva_contrasenia, id_usuario))

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Usuario actualizado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/eliminar_usuario/<int:id_usuario>', methods=['DELETE'])
def eliminar_usuario(id_usuario):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("DELETE FROM Usuarios WHERE idUsuarios = %s", (id_usuario,))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Usuario eliminado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

# ===============================================
# CRUD AULAS
# ===============================================
@app.route('/obtener_aulas', methods=['GET'])
def obtener_aulas():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT a.id_aula, a.nombre,
                   SUM(CASE WHEN c.estado_actual = 'Funcionando' THEN 1 ELSE 0 END) as bdr_disponibles,
                   a.bdr_max, a.proyector, a.splitter, a.audio
            FROM Aulas a
            LEFT JOIN Computadoras c ON a.id_aula = c.id_aula
            GROUP BY a.id_aula, a.nombre, a.bdr_max, a.proyector, a.splitter, a.audio
        "
        cursor.execute(sql)
        aulas = [{"id_aula": a[0], "nombre": a[1], "bdr_disponibles": int(a[2]),
                  "bdr_max": a[3], "proyector": bool(a[4]), "splitter": bool(a[5]), "audio": bool(a[6])}
                 for a in cursor.fetchall()]
        return jsonify(aulas)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_aula/<int:id_aula>', methods=['GET'])
def obtener_aula(id_aula):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Aulas WHERE id_aula = %s", (id_aula,))
        data = cursor.fetchone()
        if data:
            columnas = [desc[0] for desc in cursor.description]
            aula_dict = dict(zip(columnas, data))
            return jsonify(aula_dict)
        return jsonify({"error": "Aula no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crear_aula', methods=['POST'])
def crear_aula():
    datos = request.get_json()
    id_usuario = datos.get("id_usuario")
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        cursor = mysql.connection.cursor()
        id_aula = datos["id_aula"]
        bdr_max = datos.get("bdr_max", 0)

        cursor.execute("SELECT * FROM Aulas WHERE id_aula = %s", (id_aula,))
        if cursor.fetchone():
            return jsonify({"error": f"El id_aula {id_aula} ya existe"}), 400

        sql = "INSERT INTO Aulas (id_aula, nombre, bdr_max, proyector, splitter, audio) VALUES (%s, %s, %s, %s, %s, %s)"
        cursor.execute(sql, (id_aula, datos["nombre"], bdr_max, datos.get("proyector", 0), datos.get("splitter", 0), datos.get("audio", 0)))

        ultimos_dos = str(id_aula)[-2:]
        for i in range(0, bdr_max):
            id_bdr = int(f"2{ultimos_dos}{str(i).zfill(2)}")
            sql_bdr = "INSERT INTO Computadoras (id_bdr, id_aula, estado_actual, estado_mouse, estado_teclado) VALUES (%s, %s, %s, %s, %s)"
            cursor.execute(sql_bdr, (id_bdr, id_aula, "No disponible", 3, 3))

        crear_reporte_log(f"Creación de Aula: Se creó el aula {datos['nombre']} ({id_aula}) con {bdr_max} BDRs.", id_usuario, id_aula=id_aula)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Aula creada con sus computadoras"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/actualizar_aula/<int:id>', methods=['PUT'])
def actualizar_aula(id):
    datos = request.get_json()
    id_usuario = datos.get("id_usuario")
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT nombre, bdr_max, proyector, splitter, audio FROM Aulas WHERE id_aula = %s", (id,))
        resultado = cursor.fetchone()
        if not resultado:
            return jsonify({"error": "Aula no encontrada"}), 404

        nombre_actual, bdr_actual, proyector_actual, splitter_actual, audio_actual = resultado

        nuevo_bdr_max = datos.get("bdr_max")
        if nuevo_bdr_max is not None:
            nuevo_bdr_max = int(nuevo_bdr_max)
            if nuevo_bdr_max < bdr_actual:
                ultimos_dos = str(id)[-2:]
                bdr_ids_a_eliminar = [int(f"2{ultimos_dos}{str(i).zfill(2)}") for i in range(nuevo_bdr_max, bdr_actual)]
                if bdr_ids_a_eliminar:
                    placeholders = ','.join(['%s'] * len(bdr_ids_a_eliminar))
                    sql_check = f"SELECT COUNT(*) FROM Computadoras WHERE id_aula = %s AND id_bdr IN ({placeholders}) AND (id_gabinete IS NOT NULL OR id_monitor IS NOT NULL)"
                    params = [id] + bdr_ids_a_eliminar
                    cursor.execute(sql_check, tuple(params))
                    if cursor.fetchone()[0] > 0:
                        return jsonify({"error": "No se puede reducir. Hay hardware asignado a las BDRs que se eliminarían."}), 409

                    sql_delete = f"DELETE FROM Computadoras WHERE id_aula = %s AND id_bdr IN ({placeholders})"
                    cursor.execute(sql_delete, tuple(params))

            elif nuevo_bdr_max > bdr_actual:
                ultimos_dos = str(id)[-2:]
                for i in range(bdr_actual, nuevo_bdr_max):
                    id_bdr = int(f"2{ultimos_dos}{str(i).zfill(2)}")
                    sql_bdr = "INSERT INTO Computadoras (id_bdr, id_aula, estado_actual, estado_mouse, estado_teclado) VALUES (%s, %s, %s, %s, %s)"
                    cursor.execute(sql_bdr, (id_bdr, id, "No disponible", 3, 3))

        campos_a_actualizar = []
        valores = []
        for campo in ["nombre", "bdr_max", "proyector", "splitter", "audio"]:
            if campo in datos:
                campos_a_actualizar.append(f"{campo} = %s")
                valores.append(datos[campo])

        if campos_a_actualizar:
            sql_update_aula = f"UPDATE Aulas SET {', '.join(campos_a_actualizar)} WHERE id_aula = %s"
            valores.append(id)
            cursor.execute(sql_update_aula, tuple(valores))

        if 'nombre' in datos and datos['nombre'] != nombre_actual:
            crear_reporte_log(f"Se cambió el nombre del aula {id} de '{nombre_actual}' a '{datos['nombre']}'.", id_usuario, id_aula=id)
        if 'proyector' in datos and bool(datos['proyector']) != bool(proyector_actual):
            crear_reporte_log(f"Proyector del aula {id} marcado como {'funcional' if datos['proyector'] else 'no funcional'}.", id_usuario, id_aula=id)
        if 'splitter' in datos and bool(datos['splitter']) != bool(splitter_actual):
            crear_reporte_log(f"Splitter del aula {id} marcado como {'funcional' if datos['splitter'] else 'no funcional'}.", id_usuario, id_aula=id)
        if 'audio' in datos and bool(datos['audio']) != bool(audio_actual):
             crear_reporte_log(f"Audio del aula {id} marcado como {'funcional' if datos['audio'] else 'no funcional'}.", id_usuario, id_aula=id)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Aula actualizada correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/eliminar_aula/<int:id>', methods=['DELETE'])
def eliminar_aula(id):
    datos = request.get_json()
    id_usuario = datos.get("id_usuario")
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT nombre FROM Aulas WHERE id_aula = %s", (id,))
        resultado = cursor.fetchone()
        nombre_aula = resultado[0] if resultado else f"ID {id}"

        cursor.execute("DELETE FROM Reportes WHERE id_aula = %s", (id,))
        cursor.execute("UPDATE Computadoras SET id_gabinete = NULL, id_monitor = NULL WHERE id_aula = %s", (id,))
        cursor.execute("DELETE FROM Computadoras WHERE id_aula = %s", (id,))
        cursor.execute("DELETE FROM Aulas WHERE id_aula = %s", (id,))

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Aula y sus computadoras eliminadas"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

# ===============================================
# CRUD GABINETES
# ===============================================
@app.route('/obtener_gabinetes', methods=['GET'])
def obtener_gabinetes():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT g.*, c.id_aula, c.id_bdr
            FROM Gabinetes g
            LEFT JOIN Computadoras c ON g.id_gabinete = c.id_gabinete
        "
        cursor.execute(sql)
        gabinetes = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        return jsonify(gabinetes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_gabinete/<int:id_gabinete>', methods=['GET'])
def obtener_gabinete(id_gabinete):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Gabinetes WHERE id_gabinete = %s", (id_gabinete,))
        data = cursor.fetchone()
        if data:
            gabinete_dict = dict(zip([column[0] for column in cursor.description], data))
            return jsonify(gabinete_dict)
        return jsonify({"error": "Gabinete no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/gabinetes_disponibles', methods=['GET'])
def obtener_gabinetes_disponibles():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT id_gabinete, ram, disco, procesador FROM Gabinetes
            WHERE id_gabinete NOT IN (SELECT DISTINCT id_gabinete FROM Computadoras WHERE id_gabinete IS NOT NULL)
        "
        cursor.execute(sql)
        gabinetes = [{"id_gabinete": g[0], "ram": g[1], "disco": g[2], "procesador": g[3]} for g in cursor.fetchall()]
        return jsonify(gabinetes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crear_gabinete', methods=['POST'])
def crear_gabinete():
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()
        sql = "
            INSERT INTO Gabinetes (ram, disco, so, procesador, motherboard, fuenteAlimen)
            VALUES (%s, %s, %s, %s, %s, %s)
        "
        cursor.execute(sql, (datos.get("ram"), datos.get("disco"), datos.get("so"),
                             datos.get("procesador"), datos.get("motherboard"), datos.get("fuenteAlimen")))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete creado"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/actualizar_gabinete/<int:id_gabinete>', methods=['PUT'])
def actualizar_gabinete(id_gabinete):
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()
        sql = "
            UPDATE Gabinetes SET ram=%s, disco=%s, so=%s, procesador=%s, motherboard=%s, fuenteAlimen=%s
            WHERE id_gabinete = %s
        "
        cursor.execute(sql, (datos.get("ram"), datos.get("disco"), datos.get("so"),
                             datos.get("procesador"), datos.get("motherboard"),
                             datos.get("fuenteAlimen"), id_gabinete))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete actualizado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/eliminar_gabinete/<int:id>', methods=['DELETE'])
def eliminar_gabinete(id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE Computadoras SET id_gabinete = NULL WHERE id_gabinete = %s", (id,))
        cursor.execute("DELETE FROM Gabinetes WHERE id_gabinete = %s", (id,))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete eliminado"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

# ===============================================
# CRUD MONITORES
# ===============================================
@app.route('/obtener_monitores', methods=['GET'])
def obtener_monitores():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT m.id_monitor, m.marca, m.modelo, m.salida_video, c.id_aula, c.id_bdr
            FROM Monitores m
            LEFT JOIN Computadoras c ON m.id_monitor = c.id_monitor
        "
        cursor.execute(sql)
        monitores = [{"id_monitor": m[0], "marca": m[1], "modelo": m[2], "salida_video": m[3],
                      "id_aula": m[4], "id_bdr": m[5]} for m in cursor.fetchall()]
        return jsonify(monitores)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_monitor/<int:id_monitor>', methods=['GET'])
def obtener_monitor(id_monitor):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT * FROM Monitores WHERE id_monitor = %s", (id_monitor,))
        data = cursor.fetchone()
        if data:
            columnas = [desc[0] for desc in cursor.description]
            monitor_dict = dict(zip(columnas, data))
            return jsonify(monitor_dict)
        return jsonify({"error": "Monitor no encontrado"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/monitores_disponibles', methods=['GET'])
def obtener_monitores_disponibles():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT id_monitor, marca, modelo FROM Monitores
            WHERE id_monitor NOT IN (SELECT DISTINCT id_monitor FROM Computadoras WHERE id_monitor IS NOT NULL)
        "
        cursor.execute(sql)
        monitores = [{"id_monitor": m[0], "marca": m[1], "modelo": m[2]} for m in cursor.fetchall()]
        return jsonify(monitores)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crear_monitor', methods=['POST'])
def crear_monitor():
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()
        sql = "INSERT INTO Monitores (marca, modelo, salida_video) VALUES (%s, %s, %s)"
        cursor.execute(sql, (datos.get("marca"), datos.get("modelo"), datos.get("salida_video")))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Monitor creado"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/actualizar_monitor/<int:id_monitor>', methods=['PUT'])
def actualizar_monitor(id_monitor):
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()
        sql = "UPDATE Monitores SET marca=%s, modelo=%s, salida_video=%s WHERE id_monitor = %s"
        cursor.execute(sql, (datos.get("marca"), datos.get("modelo"), datos.get("salida_video"), id_monitor))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Monitor actualizado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/eliminar_monitor/<int:id>', methods=['DELETE'])
def eliminar_monitor(id):
    try:
        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE Computadoras SET id_monitor = NULL WHERE id_monitor = %s", (id,))
        cursor.execute("DELETE FROM Monitores WHERE id_monitor = %s", (id,))
        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Monitor eliminado"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

# ===============================================
# COMPUTADORAS (BDRS) Y COMPONENTES
# ===============================================
@app.route('/obtener_computadoras', methods=['GET'])
def obtener_computadoras():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT
                c.id_bdr, c.id_aula, c.estado_actual, c.estado_mouse, c.estado_teclado,
                g.id_gabinete, g.ram, g.disco, g.so, g.procesador, g.motherboard, g.fuenteAlimen,
                m.id_monitor, m.marca as marca_monitor, m.modelo as modelo_monitor,
                a.nombre as nombre_aula
            FROM Computadoras c
            JOIN Aulas a ON c.id_aula = a.id_aula
            LEFT JOIN Gabinetes g ON c.id_gabinete = g.id_gabinete
            LEFT JOIN Monitores m ON c.id_monitor = m.id_monitor
            ORDER BY c.id_aula, c.id_bdr
        "
        cursor.execute(sql)
        computadoras = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        return jsonify(computadoras)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@app.route('/obtener_computadoras_aula/<int:id_aula>', methods=['GET'])
def obtener_computadoras_aula(id_aula):
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT
                c.id_bdr, c.id_aula, c.estado_actual, c.estado_mouse, c.estado_teclado,
                g.id_gabinete, g.ram, g.disco, g.so, g.procesador, g.motherboard, g.fuenteAlimen,
                m.id_monitor, m.marca as marca_monitor, m.modelo as modelo_monitor,
                a.nombre as nombre_aula
            FROM Computadoras c
            JOIN Aulas a ON c.id_aula = a.id_aula
            LEFT JOIN Gabinetes g ON c.id_gabinete = g.id_gabinete
            LEFT JOIN Monitores m ON c.id_monitor = m.id_monitor
            WHERE c.id_aula = %s
        "
        cursor.execute(sql, (id_aula,))
        computadoras = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        return jsonify(computadoras)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/obtener_computadora/<int:id_bdr>', methods=['GET'])
def obtener_computadora(id_bdr):
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT
                c.id_bdr, c.id_aula, c.estado_actual, c.estado_mouse, c.estado_teclado,
                g.id_gabinete, g.ram, g.disco, g.so, g.procesador, g.motherboard, g.fuenteAlimen,
                m.id_monitor, m.marca as marca_monitor, m.modelo as modelo_monitor,
                a.nombre as nombre_aula
            FROM Computadoras c
            JOIN Aulas a ON c.id_aula = a.id_aula
            LEFT JOIN Gabinetes g ON c.id_gabinete = g.id_gabinete
            LEFT JOIN Monitores m ON c.id_monitor = m.id_monitor
            WHERE c.id_bdr = %s
        "
        cursor.execute(sql, (id_bdr,))
        row = cursor.fetchone()
        if row:
            computadora = dict(zip([column[0] for column in cursor.description], row))
            return jsonify(computadora)
        return jsonify({"error": "Computadora no encontrada"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/actualizar_perifericos/<int:id_bdr>/<int:id_aula>', methods=['PUT'])
def actualizar_perifericos(id_bdr, id_aula):
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400
    try:
        nuevo_estado_mouse = datos.get('estado_mouse')
        nuevo_estado_teclado = datos.get('estado_teclado')
        cursor = mysql.connection.cursor()
        cursor.execute("SELECT estado_mouse, estado_teclado, estado_actual FROM Computadoras WHERE id_bdr = %s AND id_aula = %s", (id_bdr, id_aula))
        res = cursor.fetchone()
        if not res:
            return jsonify({"error": "Computadora no encontrada"}), 404

        mouse_actual, teclado_actual, bdr_actual = res
        cursor.execute("UPDATE Computadoras SET estado_mouse = %s, estado_teclado = %s WHERE id_bdr = %s AND id_aula = %s",
                       (nuevo_estado_mouse, nuevo_estado_teclado, id_bdr, id_aula))

        nuevo_estado_bdr = None
        if 'No funciona' in [nuevo_estado_mouse, nuevo_estado_teclado] and bdr_actual != 'No disponible':
            nuevo_estado_bdr = 'No disponible'
        elif nuevo_estado_mouse == 'Funciona' and nuevo_estado_teclado == 'Funciona' and bdr_actual != 'Funcionando':
            nuevo_estado_bdr = 'Funcionando'

        if nuevo_estado_bdr:
            cursor.execute("UPDATE Computadoras SET estado_actual = %s WHERE id_bdr = %s AND id_aula = %s", (nuevo_estado_bdr, id_bdr, id_aula))

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Periféricos actualizados correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/cambiar_estado', methods=['PUT'])
def cambiar_estado_bdr():
    try:
        datos = request.get_json()
        id_bdr, id_aula = datos['id_bdr'], datos['id_aula']
        nuevo_estado, id_usuario = datos['nuevo_estado'], datos['id_usuario']

        if nuevo_estado in ["En revision", "Funcionando"]:
            if not tiene_permiso(id_usuario, ["soporte", "profesor-tecnica", "admin"]):
                return jsonify({"error": "No tienes permisos para esta acción"}), 403

        cursor = mysql.connection.cursor()

        cursor.execute("SELECT nombre FROM Aulas WHERE id_aula = %s", (id_aula,))
        resultado_aula = cursor.fetchone()
        nombre_aula = resultado_aula[0] if resultado_aula else f"ID {id_aula}"
        ultimos_dos_bdr = str(id_bdr)[-2:]

        cursor.execute("UPDATE Computadoras SET estado_actual = %s WHERE id_bdr = %s AND id_aula = %s", (nuevo_estado, id_bdr, id_aula))

        cursor.execute("SELECT id_gabinete FROM Computadoras WHERE id_bdr = %s AND id_aula = %s", (id_bdr, id_aula))
        resultado_gabinete = cursor.fetchone()
        id_gabinete_asociado = resultado_gabinete[0] if resultado_gabinete else None

        info_reporte = f"Cambio de estado en {nombre_aula}, BDR {ultimos_dos_bdr}: Se marcó como {nuevo_estado}."

        crear_reporte_log(info_reporte, id_usuario, id_bdr, id_aula, id_gabinete=id_gabinete_asociado)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": f"Estado actualizado a '{nuevo_estado}'"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/asignar_gabinete', methods=['PUT'])
def asignar_gabinete():
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        id_bdr, id_aula, id_gabinete = datos.get('id_bdr'), datos.get('id_aula'), datos.get('id_gabinete')

        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE Computadoras SET id_gabinete = %s WHERE id_bdr = %s AND id_aula = %s", (id_gabinete, id_bdr, id_aula))

        info_log = f"Colocacion de gabinete: El gabinete {id_gabinete} fue puesto en la BDR {id_bdr} del aula {id_aula}."
        crear_reporte_log(info_log, id_usuario, id_bdr, id_aula, id_gabinete)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete asignado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/quitar_gabinete', methods=['PUT'])
def quitar_gabinete():
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        id_gabinete = datos.get('id_gabinete')

        cursor = mysql.connection.cursor()
        cursor.execute("SELECT id_bdr, id_aula FROM Computadoras WHERE id_gabinete = %s", (id_gabinete,))
        res = cursor.fetchone()
        id_bdr, id_aula = (res[0], res[1]) if res else (None, None)

        cursor.execute("UPDATE Computadoras SET id_gabinete = NULL, estado_actual = 'No disponible' WHERE id_gabinete = %s", (id_gabinete,))

        info_log = f"Gabinete desasignado: Se quitó el gabinete {id_gabinete} de la BDR {id_bdr}, aula {id_aula}."
        crear_reporte_log(info_log, id_usuario, id_bdr, id_aula, id_gabinete)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete quitado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/mover_gabinete', methods=['PUT'])
def mover_gabinete():
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        id_gabinete = datos.get('id_gabinete')
        id_bdr_nuevo, id_aula_nueva = datos.get('id_bdr_nuevo'), datos.get('id_aula_nueva')

        cursor = mysql.connection.cursor()

        cursor.execute("SELECT id_bdr, id_aula FROM Computadoras WHERE id_gabinete = %s", (id_gabinete,))
        res = cursor.fetchone()
        id_bdr_viejo, id_aula_vieja = (res[0], res[1]) if res else ('desconocida', 'desconocida')

        cursor.execute("UPDATE Computadoras SET id_gabinete = NULL, estado_actual = 'No disponible' WHERE id_gabinete = %s", (id_gabinete,))
        cursor.execute("UPDATE Computadoras SET id_gabinete = %s WHERE id_bdr = %s AND id_aula = %s", (id_gabinete, id_bdr_nuevo, id_aula_nueva))

        info_log = f"Movimiento de Gabinete: Se movió de la BDR {id_bdr_viejo} (Aula {id_aula_vieja}) a la BDR {id_bdr_nuevo} (Aula {id_aula_nueva})."
        crear_reporte_log(info_log, id_usuario, id_bdr_nuevo, id_aula_nueva, id_gabinete)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Gabinete movido con éxito"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/asignar_monitor', methods=['PUT'])
def asignar_monitor():
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        id_bdr, id_aula, id_monitor = datos.get('id_bdr'), datos.get('id_aula'), datos.get('id_monitor')
        cursor = mysql.connection.cursor()
        cursor.execute("UPDATE Computadoras SET id_monitor = %s WHERE id_bdr = %s AND id_aula = %s", (id_monitor, id_bdr, id_aula))

        info_log = f"Asignación de monitor: El monitor {id_monitor} fue asignado a la BDR {id_bdr} del aula {id_aula}."
        crear_reporte_log(info_log, id_usuario, id_bdr, id_aula)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Monitor asignado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/computadora/quitar_monitor', methods=['PUT'])
def quitar_monitor():
    datos = request.get_json()
    id_usuario = datos.get('id_usuario')
    if not id_usuario:
        return jsonify({"error": "Se requiere id_usuario para esta acción"}), 400

    try:
        id_monitor = datos.get('id_monitor')
        cursor = mysql.connection.cursor()

        cursor.execute("SELECT id_bdr, id_aula FROM Computadoras WHERE id_monitor = %s", (id_monitor,))
        res = cursor.fetchone()
        id_bdr, id_aula = (res[0], res[1]) if res else (None, None)

        cursor.execute("UPDATE Computadoras SET id_monitor = NULL WHERE id_monitor = %s", (id_monitor,))

        info_log = f"Monitor desasignado: Se quitó el monitor {id_monitor} de la BDR {id_bdr}, aula {id_aula}."
        crear_reporte_log(info_log, id_usuario, id_bdr, id_aula)

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Monitor quitado correctamente"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

# ===============================================
# REPORTES
# ===============================================
@app.route('/obtener_reportes', methods=['GET'])
def obtener_reportes():
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT r.id_reportes, r.fec_aviso, r.info_problema, r.estado_nuevo, u.email, r.id_bdr, r.id_aula, r.id_gabinete
            FROM Reportes r
            JOIN Usuarios u ON r.id_usuario = u.idUsuarios
            ORDER BY r.fec_aviso DESC
        "
        cursor.execute(sql)
        reportes = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        # Convertir fecha a string
        for r in reportes:
            r['fec_aviso'] = r['fec_aviso'].isoformat() if r['fec_aviso'] else None
        return jsonify(reportes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/crear_reporte', methods=['POST'])
def crear_reporte():
    try:
        datos = request.get_json()
        cursor = mysql.connection.cursor()

        ahora_en_argentina = datetime.now(ZoneInfo("America/Argentina/Buenos_Aires"))
        sql = "
            INSERT INTO Reportes (fec_aviso, info_problema, estado_nuevo, id_usuario, id_bdr, id_aula, id_gabinete)
            VALUES (%s, %s, %s, %s, %s, %s, %s)
        "
        cursor.execute(sql, (
            ahora_en_argentina,
            datos.get("info_problema"),
            datos.get("estado_nuevo"),
            datos["id_usuario"],
            datos.get("id_bdr"),
            datos.get("id_aula"),
            datos.get("id_gabinete")
        ))

        if datos.get("estado_nuevo") and datos.get("id_bdr") and datos.get("id_aula"):
            cursor.execute("UPDATE Computadoras SET estado_actual=%s WHERE id_bdr=%s AND id_aula=%s",
                           (datos.get("estado_nuevo"), datos.get("id_bdr"), datos.get("id_aula")))

        mysql.connection.commit()
        return jsonify({"success": True, "mensaje": "Reporte creado"})
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"error": str(e)}), 500

@app.route('/reportes_por_gabinete/<int:id_gabinete>', methods=['GET'])
def reportes_por_gabinete(id_gabinete):
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT r.id_reportes, r.fec_aviso, r.info_problema, r.estado_nuevo, u.email
            FROM Reportes r
            JOIN Usuarios u ON r.id_usuario = u.idUsuarios
            WHERE r.id_gabinete = %s
            ORDER BY r.fec_aviso DESC
        "
        cursor.execute(sql, (id_gabinete,))
        reportes = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        for r in reportes:
            r['fec_aviso'] = r['fec_aviso'].isoformat() if r['fec_aviso'] else None
        return jsonify(reportes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/reportes_por_aula/<int:id_aula>', methods=['GET'])
def reportes_por_aula(id_aula):
    try:
        cursor = mysql.connection.cursor()
        sql = "
            SELECT r.id_reportes, r.fec_aviso, r.info_problema, r.estado_nuevo, u.email, r.id_bdr
            FROM Reportes r
            JOIN Usuarios u ON r.id_usuario = u.idUsuarios
            WHERE r.id_aula = %s
            ORDER BY r.fec_aviso DESC
            LIMIT 50
        "
        cursor.execute(sql, (id_aula,))
        reportes = [dict(zip([column[0] for column in cursor.description], row)) for row in cursor.fetchall()]
        for r in reportes:
            r['fec_aviso'] = r['fec_aviso'].isoformat() if r['fec_aviso'] else None
        return jsonify(reportes)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/eliminar_reporte/<int:id_reporte>', methods=['DELETE'])
def eliminar_reporte(id_reporte):
    try:
        datos = request.get_json()
        id_usuario = datos.get('id_usuario')

        if not tiene_permiso(id_usuario, ["admin"]):
            return jsonify({"success": False, "error": "No tienes permisos para realizar esta acción"}), 403

        cursor = mysql.connection.cursor()
        filas_afectadas = cursor.execute("DELETE FROM Reportes WHERE id_reportes = %s", (id_reporte,))
        mysql.connection.commit()

        if filas_afectadas > 0:
            return jsonify({"success": True, "mensaje": "Reporte eliminado correctamente"})
        else:
            return jsonify({"success": False, "error": "Reporte no encontrado"}), 404
    except Exception as e:
        mysql.connection.rollback()
        return jsonify({"success": False, "error": str(e)}), 500

# ===============================================
# EJECUCIÓN DE LA APP
# ===============================================
if __name__ == "__main__":
    app.run(debug=True)
"""
        self.title_label = tk.Label(root, text="Conversor de Código a PDF", font=("Helvetica", 16, "bold"))
        self.title_label.pack(pady=10)
        edit_frame = tk.Frame(root)
        edit_frame.pack(pady=5)
        self.edit_tables_button = tk.Button(edit_frame, text="Editar Descripciones de Tablas", command=self.edit_table_descriptions)
        self.edit_tables_button.pack(side=tk.LEFT, padx=10)
        self.edit_code_button = tk.Button(edit_frame, text="Editar Código Python", command=self.edit_python_code)
        self.edit_code_button.pack(side=tk.LEFT, padx=10)
        selection_frame = tk.Frame(root)
        selection_frame.pack(pady=10)
        self.select_files_button = tk.Button(selection_frame, text="Añadir Archivo(s) Adicionales", command=self.select_files, width=25)
        self.select_files_button.pack(side=tk.LEFT, padx=10)
        self.select_folder_button = tk.Button(selection_frame, text="Añadir Carpeta Adicional", command=self.select_folder, width=25)
        self.select_folder_button.pack(side=tk.LEFT, padx=10)
        self.selected_files_label = tk.Label(root, text="Archivos adicionales seleccionados: 0", wraplength=450)
        self.selected_files_label.pack(pady=10)
        self.generate_pdf_button = tk.Button(root, text="Generar PDF Completo", command=self.generate_pdf, width=30, height=2)
        self.generate_pdf_button.pack(pady=20)

    def edit_content(self, title, content_variable_name):
        editor_window = tk.Toplevel(self.root)
        editor_window.title(title)
        editor_window.geometry("800x600")
        text_widget = scrolledtext.ScrolledText(editor_window, wrap=tk.WORD, font=("Courier New", 10))
        text_widget.pack(expand=True, fill='both', padx=10, pady=10)
        current_content = getattr(self, content_variable_name)
        text_widget.insert(tk.END, current_content)
        def save_and_close():
            edited_content = text_widget.get("1.0", tk.END)
            setattr(self, content_variable_name, edited_content)
            editor_window.destroy()
        save_button = tk.Button(editor_window, text="Guardar y Cerrar", command=save_and_close)
        save_button.pack(pady=10)

    def edit_table_descriptions(self):
        self.edit_content("Editar Descripciones de Tablas", "table_descriptions_text")

    def edit_python_code(self):
        self.edit_content("Editar Código Python", "python_code_text")

    def select_files(self):
        # ===== INICIO DE LA CORRECCIÓN =====
        # Se cambió el argumento 'filetypes' para que sea una lista de tuplas.
        # Esto soluciona el TclError y permite seleccionar cualquier tipo de archivo.
        selected = filedialog.askopenfilenames(
            title="Seleccionar archivos de código adicionales",
            filetypes=[("Todos los archivos", "*.*")]
        )
        # ===== FIN DE LA CORRECCIÓN =====
        self.file_paths.extend(list(selected))
        self.update_selected_files_label()

    def select_folder(self):
        folder_path = filedialog.askdirectory(title="Seleccionar carpeta con archivos de código adicionales")
        if folder_path:
            files_in_folder = [os.path.join(folder_path, f) for f in os.listdir(folder_path) if os.path.isfile(os.path.join(folder_path, f))]
            self.file_paths.extend(files_in_folder)
            self.update_selected_files_label()

    def update_selected_files_label(self):
        num_files = len(self.file_paths)
        self.selected_files_label.config(text=f"Archivos adicionales seleccionados: {num_files}")

    def generate_pdf(self):
        save_path = filedialog.asksaveasfilename(title="Guardar PDF como...", defaultextension=".pdf", filetypes=(("Archivos PDF", "*.pdf"),))
        if not save_path:
            return
        try:
            pdf = FPDF()
            pdf.set_auto_page_break(auto=True, margin=15)
            pdf.add_page()
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, "Descripciones de las Tablas de la Base de Datos", 0, 1, 'C')
            pdf.ln(10)
            pdf.set_font("Courier", size=10)
            clean_text_tables = self.table_descriptions_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 5, clean_text_tables)
            pdf.add_page()
            pdf.set_font("Arial", 'B', 16)
            pdf.cell(0, 10, "Código de la API (Python/Flask)", 0, 1, 'C')
            pdf.ln(10)
            pdf.set_font("Courier", size=10)
            clean_text_code = self.python_code_text.encode('latin-1', 'replace').decode('latin-1')
            pdf.multi_cell(0, 5, clean_text_code)
            if self.file_paths:
                for file_path in self.file_paths:
                    pdf.add_page()
                    file_name = os.path.basename(file_path)
                    pdf.set_font("Arial", 'B', 14)
                    pdf.cell(0, 10, f"Contenido Adicional de: {file_name}", 0, 1, 'C')
                    pdf.ln(5)
                    pdf.set_font("Courier", size=10)
                    try:
                        with open(file_path, 'r', encoding='utf-8') as f:
                            for line in f:
                                clean_line = line.encode('latin-1', 'replace').decode('latin-1')
                                pdf.multi_cell(0, 5, clean_line)
                    except Exception as e:
                        pdf.set_text_color(255, 0, 0)
                        pdf.multi_cell(0, 5, f"Error al leer el archivo: {e}")
                        pdf.set_text_color(0, 0, 0)
            pdf.output(save_path)
            messagebox.showinfo("Éxito", f"El archivo PDF ha sido guardado en:\n{save_path}")
        except Exception as e:
            messagebox.showerror("Error", f"Ocurrió un error al generar el PDF:\n{e}")

def iniciar_conversor_codigo(lanzador):
    """Función que lanza la herramienta 2."""
    lanzador.withdraw()
    ventana_conversor = tk.Toplevel(lanzador)
    
    app = CodeToPDFConverter(ventana_conversor)

    def al_cerrar():
        lanzador.deiconify()
        ventana_conversor.destroy()

    ventana_conversor.protocol("WM_DELETE_WINDOW", al_cerrar)

# =================================================================================
# LANZADOR PRINCIPAL
# =================================================================================

if __name__ == "__main__":
    ventana_lanzador = tk.Tk()
    ventana_lanzador.title("Herramienta de Creación de PDFs")
    ventana_lanzador.geometry("450x200")

    titulo = tk.Label(ventana_lanzador, text="Seleccione la herramienta a utilizar", font=("Helvetica", 14, "bold"))
    titulo.pack(pady=20)

    frame_botones = tk.Frame(ventana_lanzador)
    frame_botones.pack(pady=10)

    boton_herramienta1 = tk.Button(
        frame_botones, 
        text="1. PDF de Estructura de Carpeta", 
        command=iniciar_generador_estructura,
        width=40, height=2
    )
    boton_herramienta1.pack(pady=5)

    boton_herramienta2 = tk.Button(
        frame_botones, 
        text="2. PDF de Documentación de Código", 
        command=lambda: iniciar_conversor_codigo(ventana_lanzador),
        width=40, height=2
    )
    # --- CORRECCIÓN: Se descomenta la línea para que el botón aparezca ---
    boton_herramienta2.pack(pady=5)

    ventana_lanzador.mainloop()