import PageTitle from "~/components/PageTitle";
import FancyLinks from "~/components/FancyLinks";

export default function EquatorProject() {
    return <>
        <PageTitle className="text-3xl md:text-3xl lg:text-4xl">Equator</PageTitle>

        <div className="max-w-5xl mx-auto px-4 space-y-4 text-gray-700 dark:text-gray-300 leading-relaxed">
            <p>
                An expression editor and evaluator that allows easy visualization and processing of mathematical expressions. This project was developed in Rust using the GTK+ framework for the graphical user interface.
            </p>

            <p>
                The application provides a user-friendly way to input mathematical expressions, evaluate them numerically, and visualize the results through various plotting and graphing capabilities. It supports a wide range of mathematical functions and operations, making it useful for both educational purposes and practical calculations.
            </p>

            <p>
                The GTK+ integration ensures cross-platform compatibility and a native look and feel across different operating systems. The Rust implementation provides robust error handling and efficient expression parsing, while the modular architecture allows for easy extension with additional mathematical functions and visualization options.
            </p>

            <FancyLinks className="text-left" links={[
                { text: "GitHub", to: "https://github.com/trolleyman/Equator", external: true },
            ]} />
        </div>
    </>
}
